import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { Order as OrderSchema } from "/imports/collections/schemas";
import { orderFulfillmentGroupInputSchema, orderItemInputSchema } from "../simpleSchemas";
import buildOrderFulfillmentGroupFromInput from "../util/buildOrderFulfillmentGroupFromInput";
import updateGroupStatusFromItemStatus from "../util/updateGroupStatusFromItemStatus";
import updateGroupTotals from "../util/updateGroupTotals";

const groupInputSchema = orderFulfillmentGroupInputSchema.clone().extend({
  // Make items optional since we have the option of moving items
  // from another group
  "items": {
    type: Array,
    optional: true,
    minCount: 1
  },
  "items.$": orderItemInputSchema
});

const inputSchema = new SimpleSchema({
  "fulfillmentGroup": groupInputSchema,
  "moveItemIds": {
    type: Array,
    optional: true,
    minCount: 1
  },
  "moveItemIds.$": String,
  "orderId": String
});

/**
 * @method addOrderFulfillmentGroup
 * @summary Use this mutation to add a new order fulfillment group to an order. It must have at least one
 *   item, which can be provided or moved from another existing group.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `order` property containing the updated order and a
 *   `newFulfillmentGroupId` property set to the ID of the added group
 */
export default async function addOrderFulfillmentGroup(context, input) {
  inputSchema.validate(input);

  const {
    fulfillmentGroup: inputGroup,
    moveItemIds,
    orderId
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

  const { billingAddress, cartId, currencyCode } = order;

  // If there are moveItemIds, find and pull them from their current groups
  let updatedGroups;
  const orderSurcharges = [];
  const movingItems = [];
  if (moveItemIds) {
    updatedGroups = await Promise.all(order.shipping.map(async (group) => {
      let movedSomeItems = false;
      const updatedItems = group.items.reduce((list, item) => {
        if (moveItemIds.includes(item._id)) {
          movingItems.push(item);
          movedSomeItems = true;
        } else {
          list.push(item);
        }
        return list;
      }, []);

      if (!movedSomeItems) return group;

      if (updatedItems.length === 0) {
        throw new ReactionError("invalid-param", "moveItemIds would result in group having no items");
      }

      const updatedGroup = {
        ...group,
        // There is a convenience itemIds prop, so update that, too
        itemIds: updatedItems.map((item) => item._id),
        items: updatedItems,
        totalItemQuantity: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };

      // Update group shipping, tax, totals, etc.
      const { groupSurcharges } = await updateGroupTotals(context, {
        billingAddress,
        cartId,
        currencyCode,
        discountTotal: updatedGroup.invoice.discounts,
        group: updatedGroup,
        orderId,
        selectedFulfillmentMethodId: updatedGroup.shipmentMethod._id
      });

      // Push all group surcharges to overall order surcharge array.
      // Currently, we do not save surcharges per group
      orderSurcharges.push(...groupSurcharges);

      // Ensure proper group status
      updateGroupStatusFromItemStatus(updatedGroup);

      // Return the group, with items and workflow potentially updated.
      return updatedGroup;
    }));

    if (moveItemIds.length !== movingItems.length) {
      throw new ReactionError("invalid-param", "Some moveItemIds did not match any item IDs on the order");
    }
  } else {
    updatedGroups = [...order.shipping];
    if (Array.isArray(order.surcharges)) orderSurcharges.push(...order.surcharges);
  }

  // Now build the new group we are adding
  const { group: newGroup, groupSurcharges } = await buildOrderFulfillmentGroupFromInput(context, {
    // If we are moving any items from existing groups to this new group, push those into
    // the newGroup items array.
    additionalItems: movingItems,
    billingAddress,
    cartId,
    currencyCode,
    // No support for discounts for now. Pending future promotions revamp.
    discountTotal: 0,
    inputGroup,
    orderId
  });

  // Add the new group to the order groups list
  updatedGroups.push(newGroup);

  // Push all group surcharges to overall order surcharge array.
  // Currently, we do not save surcharges per group
  orderSurcharges.push(...groupSurcharges);

  // Now we're ready to update the database
  const modifier = {
    $set: {
      shipping: updatedGroups,
      surcharges: orderSurcharges,
      totalItemQuantity: updatedGroups.reduce((sum, group) => sum + group.totalItemQuantity, 0),
      updatedAt: new Date()
    }
  };

  OrderSchema.validate(modifier, { modifier: true });

  const { modifiedCount, value: updatedOrder } = await Orders.findOneAndUpdate(
    { _id: orderId },
    modifier,
    { returnOriginal: false }
  );
  if (modifiedCount === 0 || !updatedOrder) throw new ReactionError("server-error", "Unable to update order");

  await appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: userId
  });

  return { newFulfillmentGroupId: newGroup._id, order: updatedOrder };
}
