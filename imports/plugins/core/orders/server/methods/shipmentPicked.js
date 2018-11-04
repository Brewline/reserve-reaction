import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name orders/shipmentPicked
 * @method
 * @memberof Orders/Methods
 * @summary update picking status
 * @param {Object} order - order object
 * @param {Object} fulfillmentGroup - fulfillmentGroup object
 * @return {Object} return workflow result
 */
export default function shipmentPicked(order, fulfillmentGroup) {
  check(order, Object);
  check(fulfillmentGroup, Object);

  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Set the status of the items as picked
  const { itemIds } = fulfillmentGroup;

  const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/picked", order, itemIds);
  if (result === 1) {
    return Orders.update(
      {
        "_id": order._id,
        "shipping._id": fulfillmentGroup._id
      },
      {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/picked"
        },
        $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/picked"
        }
      },
      { bypassCollection2: true }
    );
  }
  return result;
}
