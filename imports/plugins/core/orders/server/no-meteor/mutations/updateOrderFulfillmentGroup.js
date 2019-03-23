import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { Order as OrderSchema } from "/imports/collections/schemas";

const inputSchema = new SimpleSchema({
  tracking: {
    type: String,
    optional: true
  },
  trackingUrl: {
    type: String,
    optional: true
  },
  orderFulfillmentGroupId: String,
  orderId: String,
  status: {
    type: String,
    optional: true
  }
});

/**
 * @method updateOrderFulfillmentGroup
 * @summary Use this mutation to update an order fulfillment group status and tracking information
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `order` property containing the updated order
 */
export default async function updateOrderFulfillmentGroup(context, input) {
  inputSchema.validate(input);

  const {
    tracking,
    trackingUrl,
    orderFulfillmentGroupId,
    orderId,
    status
  } = input;

  const { appEvents, collections, isInternalCall, userHasPermission, userId } = context;
  const { Orders } = collections;

  // First verify that this order actually exists
  const order = await Orders.findOne({ _id: orderId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  // Allow update if the account has "orders" permission. When called internally by another
  // plugin, context.isInternalCall can be set to `true` to disable this check.
  if (!isInternalCall && !userHasPermission(["orders"], order.shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Verify that there is a group with the ID
  const orderFulfillmentGroup = order.shipping.find((group) => group._id === orderFulfillmentGroupId);
  if (!orderFulfillmentGroup) throw new ReactionError("not-found", "Order fulfillment group not found");

  const modifier = {
    $set: {
      "shipping.$.updatedAt": new Date(),
      "updatedAt": new Date()
    }
  };

  if (tracking) modifier.$set["shipping.$.tracking"] = tracking;
  if (trackingUrl) modifier.$set["shipping.$.trackingUrl"] = trackingUrl;

  if (status && orderFulfillmentGroup.workflow.status !== status) {
    modifier.$set["shipping.$.workflow.status"] = status;
    modifier.$push = {
      "shipping.$.workflow.workflow": status
    };
  }

  // Skip updating if we have no updates to make
  if (Object.keys(modifier.$set).length === 2) return { order };

  OrderSchema.validate(modifier, { modifier: true });

  const { modifiedCount, value: updatedOrder } = await Orders.findOneAndUpdate(
    {
      "_id": orderId,
      "shipping._id": orderFulfillmentGroupId
    },
    modifier,
    { returnOriginal: false }
  );
  if (modifiedCount === 0 || !updatedOrder) throw new ReactionError("server-error", "Unable to update order");

  await appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: userId
  });

  return { order: updatedOrder };
}
