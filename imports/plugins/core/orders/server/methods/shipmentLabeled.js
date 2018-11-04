import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name orders/shipmentLabeled
 * @method
 * @memberof Orders/Methods
 * @summary update labeling status
 * @param {Object} order - order object
 * @param {Object} fulfillmentGroup - fulfillmentGroup object
 * @return {Object} return workflow result
 */
export default function shipmentLabeled(order, fulfillmentGroup) {
  check(order, Object);
  check(fulfillmentGroup, Object);

  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Set the status of the items as labeled
  const { itemIds } = fulfillmentGroup;

  const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/labeled", order, itemIds);
  if (result === 1) {
    return Orders.update(
      {
        "_id": order._id,
        "shipping._id": fulfillmentGroup._id
      },
      {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/labeled"
        },
        $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/labeled"
        }
      },
      { bypassCollection2: true }
    );
  }
  return result;
}
