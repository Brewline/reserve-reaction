import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Cart, Orders, Packages, Groups } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/* eslint no-shadow: 0 */

/**
 * @file Methods for Workflow. Run these methods using `Meteor.call()`.
 * @example Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
 *
 * @namespace Workflow/Methods
 */

Meteor.methods({
  /**
   * @name workflow/pushCartWorkflow
   * @memberof Workflow/Methods
   * @method
   * @example Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
   * @summary updates cart workflow status
   * @description status in the workflow is stored as the current active workflow step.
   * first sets, second call moves status to next workflow
   * additional calls do nothing
   * user permissions to template are verified
   * @param {String} workflow - name of workflow
   * @param {String} newWorkflowStatus - name of the next workflow stage
   * @param {String} [cartId] - cart._id
   * @return {Array|Boolean|Number} return
   */
  "workflow/pushCartWorkflow"(workflow, newWorkflowStatus, cartId) {
    check(workflow, String);
    check(newWorkflowStatus, String);
    check(cartId, String);
    this.unblock();

    const defaultPackageWorkflows = [];
    let nextWorkflowStep = {
      template: ""
    };

    const currentCart = Cart.findOne({ _id: cartId });
    if (!currentCart) {
      Logger.error(`pushCartWorkflow: Cart with ID ${cartId} not found`);
      throw new Meteor.Error("not-found", "Cart not found");
    }

    const shopId = Reaction.getShopId();

    // TODO doc this
    const currentWorkflowStatus = currentCart.workflow.status;
    const packages = Packages.find({
      shopId,
      "layout.workflow": workflow
    });

    // loop through packages and set the defaultPackageWorkflows
    packages.forEach((reactionPackage) => {
      // todo fix this hack for not filtering nicely
      if (!reactionPackage.layout.layout) {
        const layouts = _.filter(reactionPackage.layout, {
          workflow
        });
        // for every layout, process the associated workflows
        _.each(layouts, (layout) => {
          // audience is the layout permissions
          if (typeof layout.audience !== "object") {
            const defaultRoles = Groups.findOne({
              slug: "customer",
              shopId
            }).permissions;
            layout.audience = defaultRoles;
          }
          if (!layout.layout) {
            defaultPackageWorkflows.push(layout);
          }
        });
      }
    });

    // statusExistsInWorkflow boolean
    const statusExistsInWorkflow = _.includes(currentCart.workflow.workflow, newWorkflowStatus);
    const maxSteps = defaultPackageWorkflows.length;
    let nextWorkflowStepIndex;
    let templateProcessedInWorkflow = false;
    let gotoNextWorkflowStep = false;

    // if we haven't populated workflows lets exit
    if (!defaultPackageWorkflows.length > 0) {
      return [];
    }

    // loop through all shop configured layouts, and their default workflows
    // to determine what the next workflow step should be
    // the cart workflow status while processing is neither true nor false (set to template)
    _.each(defaultPackageWorkflows, (workflow, currentStatusIndex) => {
      if (workflow.template === currentWorkflowStatus) {
        // don't go past the end of the workflow
        if (currentStatusIndex < maxSteps - 1) {
          Logger.debug("currentStatusIndex, maxSteps", currentStatusIndex, maxSteps);
          Logger.debug("currentStatusIndex, maxSteps", currentStatusIndex, maxSteps);
          nextWorkflowStepIndex = currentStatusIndex + 1;
        } else {
          nextWorkflowStepIndex = currentStatusIndex;
        }

        Logger.debug("nextWorkflowStepIndex", nextWorkflowStepIndex);
        // set the nextWorkflowStep as the next workflow object from registry
        nextWorkflowStep = defaultPackageWorkflows[nextWorkflowStepIndex];

        Logger.debug("setting nextWorkflowStep", nextWorkflowStep.template);
      }
    });

    // check to see if the next step has already been processed.
    // templateProcessedInWorkflow boolean
    gotoNextWorkflowStep = nextWorkflowStep.template;
    templateProcessedInWorkflow = _.includes(currentCart.workflow.workflow, nextWorkflowStep.template);

    // debug info
    Logger.debug("currentWorkflowStatus: ", currentWorkflowStatus);
    Logger.debug("workflow/pushCartWorkflow workflow: ", workflow);
    Logger.debug("newWorkflowStatus: ", newWorkflowStatus);
    Logger.debug("current cartId: ", currentCart._id);
    Logger.debug("currentWorkflow: ", currentCart.workflow.workflow);
    Logger.debug("nextWorkflowStep: ", nextWorkflowStep.template || defaultPackageWorkflows[0].template);
    Logger.debug("statusExistsInWorkflow: ", statusExistsInWorkflow);
    Logger.debug("templateProcessedInWorkflow: ", templateProcessedInWorkflow);
    Logger.debug("gotoNextWorkflowStep: ", gotoNextWorkflowStep);

    // Condition One
    // if you're going to join the workflow you need a status that is a template name.
    // this status/template is how we know
    // where you are in the flow and configures `gotoNextWorkflowStep`

    if (!gotoNextWorkflowStep && currentWorkflowStatus !== newWorkflowStatus) {
      Logger.debug(`######## Condition One #########:
        initialise the ${currentCart._id} ${workflow}:
        ${defaultPackageWorkflows[0].template}`);
      const result = Cart.update({ _id: currentCart._id }, {
        $set: {
          "workflow.status": defaultPackageWorkflows[0].template
        }
      });
      Logger.debug(result);
      return result;
    }

    // Condition Two
    // you're now accepted into the workflow,
    // but to begin the workflow you need to have a next step
    // and you should have already be in the current workflow template
    if (gotoNextWorkflowStep && statusExistsInWorkflow === false &&
      templateProcessedInWorkflow === false) {
      Logger.debug("######## Condition Two #########: set status to: ", nextWorkflowStep.template);

      return Cart.update({ _id: currentCart._id }, {
        $set: {
          "workflow.status": nextWorkflowStep.template
        },
        $addToSet: {
          "workflow.workflow": currentWorkflowStatus
        }
      });
    }

    // Condition Three
    // If you got here by skipping around willy nilly
    // we're going to do our best to ignore you.
    if (gotoNextWorkflowStep && statusExistsInWorkflow === true &&
      templateProcessedInWorkflow === false) {
      Logger.debug(
        `######## Condition Three #########: complete workflow ${currentWorkflowStatus} updates and move to: `,
        nextWorkflowStep.template
      );
      return Cart.update({ _id: currentCart._id }, {
        $set: {
          "workflow.status": nextWorkflowStep.template
        },
        $addToSet: {
          "workflow.workflow": currentWorkflowStatus
        }
      });
    }

    // Condition Four
    // you got here through hard work, and processed the previous template
    // nice job. now start over with the next step.
    if (gotoNextWorkflowStep && statusExistsInWorkflow === true &&
      templateProcessedInWorkflow === true) {
      Logger.debug(
        "######## Condition Four #########: previously ran, doing nothing. : ",
        newWorkflowStatus
      );
      return true;
    }

    return false;
  },

  /**
   * @name workflow/revertCartWorkflow
   * @memberof Workflow/Methods
   * @method
   * @summary if something was changed on the previous `cartWorkflow` steps,
   * we need to revert to this step to renew the order
   * @param {String} newWorkflowStatus - name of `cartWorkflow` step, which we need to revert
   * @param {String} cartId - The cart ID
   * @todo need tests
   * @return {Number|Boolean} cart update results
   */
  "workflow/revertCartWorkflow"(newWorkflowStatus, cartId) {
    check(newWorkflowStatus, String);
    check(cartId, String);
    this.unblock();

    const cart = Cart.findOne({ _id: cartId });
    if (!cart) {
      Logger.error(`revertCartWorkflow: Cart with ID ${cartId} not found`);
      throw new Meteor.Error("not-found", "Cart not found");
    }

    if (typeof cart.workflow !== "object") return false;
    if (typeof cart.workflow.workflow !== "object") return false;

    const { workflow } = cart.workflow;
    // get index of `newWorkflowStatus`
    const resetToIndex = workflow.indexOf(newWorkflowStatus);
    // exit if no such step in workflow
    if (resetToIndex < 0) return false;
    // remove all steps that further `newWorkflowStatus` and itself
    const resetWorkflow = workflow.slice(0, resetToIndex);

    return Cart.update({ _id: cart._id }, {
      $set: {
        "workflow.status": newWorkflowStatus,
        "workflow.workflow": resetWorkflow
      }
    });
  },

  /**
   * @name workflow/pushOrderWorkflow
   * @summary Update the order workflow: Push the status as the current workflow step,
   * move the current status to completed workflow steps
   *
   * @description Step 1 meteor call to push a new workflow
   * Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", this);
   * NOTE: "coreOrderWorkflow", "processing" will be combined into "coreOrderWorkflow/processing" and set as the status
   * Step 2 (this method) of the "workflow/pushOrderWorkflow" flow; Try to update the current status
   *
   * @method
   * @memberof Workflow/Methods
   * @param  {String} workflow workflow to push to
   * @param  {String} status - Workflow status
   * @param  {Order} order - Schemas.Order, an order object
   * @return {Boolean} true if update was successful
   */
  "workflow/pushOrderWorkflow"(workflow, status, order) {
    check(workflow, String);
    check(status, String);
    check(order, Match.ObjectIncluding({
      _id: String,
      shopId: String
    }));
    this.unblock();

    if (!Reaction.hasPermission("orders", Reaction.getUserId(), order.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // Combine (workflow) "coreOrderWorkflow", (status) "processing" into "coreOrderWorkflow/processing".
    // This combination will be used to call the method "workflow/coreOrderWorkflow/processing", if it exists.
    const workflowStatus = `${workflow}/${status}`;

    const result = Orders.update({
      _id: order._id,
      // Necessary to query on shop ID too, so they can't pass in a different ID for permission check
      shopId: order.shopId
    }, {
      $set: {
        "workflow.status": workflowStatus
      },
      $addToSet: {
        "workflow.workflow": workflowStatus
      }
    });
    if (result !== 1) {
      throw new ReactionError("server-error", "Unable to update order");
    }

    const updatedOrder = Orders.findOne({ _id: order._id });
    Promise.await(appEvents.emit("afterOrderUpdate", {
      order: updatedOrder,
      updatedBy: Reaction.getUserId()
    }));

    return result;
  },

  /**
   * @name workflow/pushItemWorkflow
   * @method
   * @memberof Workflow/Methods
   * @param  {String} status  Workflow status
   * @param  {Object} order   Schemas.Order, an order object
   * @param  {String[]} itemIds Array of item IDs
   * @return {Boolean}         true if update was successful
   */
  "workflow/pushItemWorkflow"(status, order, itemIds) {
    check(status, String);
    check(order, Match.ObjectIncluding({
      _id: String,
      shopId: String
    }));
    check(itemIds, Array);

    if (!Reaction.hasPermission("orders", Reaction.getUserId(), order.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // We can't trust the order from the client (for several reasons)
    // Initially because in a multi-merchant scenario, the order from the client
    // will contain only the items associated with their shop
    // We'll get the order from the db that has all the items

    const dbOrder = Orders.findOne({ _id: order._id });

    const shipping = dbOrder.shipping.map((group) => {
      const items = group.items.map((item) => {
        // Don't modify items unless they in our itemIds array
        if (!itemIds.includes(item._id)) {
          return item;
        }

        // Add the current status to completed workflows
        if (item.workflow.status !== "new") {
          const workflows = item.workflow.workflow || [];

          workflows.push(status);
          item.workflow.workflow = _.uniq(workflows);
        }

        // Set the new item status
        item.workflow.status = status;
        return item;
      });
      return {
        ...group,
        items
      };
    });

    const result = Orders.update({
      _id: dbOrder._id,
      // Necessary to query on shop ID too, so they can't pass in a different ID for permission check
      shopId: order.shopId
    }, {
      $set: {
        shipping
      }
    });
    if (result !== 1) {
      throw new ReactionError("server-error", "Unable to update order");
    }

    Promise.await(appEvents.emit("afterOrderUpdate", {
      order: {
        ...dbOrder,
        shipping
      },
      updatedBy: Reaction.getUserId()
    }));

    return result;
  }
});
