import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Figures out which fulfillment group a cart item should initially be in
 * @param {Object[]} currentGroups The current cart fulfillment groups array
 * @param {String[]} supportedFulfillmentTypes Array of fulfillment types supported by the item
 * @param {String} shopId The ID of the shop that owns the item (product)
 * @returns {Object|null} The group or null if no viable group
 */
function determineInitialGroupForItem(currentGroups, supportedFulfillmentTypes, shopId) {
  const compatibleGroup = currentGroups.find((group) => supportedFulfillmentTypes.indexOf(group.type) !== -1 &&
    shopId === group.shopId);
  return compatibleGroup || null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.appEvents App event emitter
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ appEvents, collections }) {
  const { Cart } = collections;

  const handler = async (updatedCart) => {
    if (!updatedCart) {
      throw new Error("afterCartUpdate hook run with no cart argument");
    }

    // Every time the cart is updated, create any missing fulfillment groups as necessary.
    // We need one group per type per shop, containing only the items from that shop.
    // Also make sure that every item is assigned to a fulfillment group.
    const currentGroups = updatedCart.shipping || [];

    let didModifyGroups = false;
    (updatedCart.items || []).forEach((item) => {
      let { supportedFulfillmentTypes } = item;
      if (!supportedFulfillmentTypes || supportedFulfillmentTypes.length === 0) {
        supportedFulfillmentTypes = ["shipping"];
      }

      // Out of the current groups, returns the one that this item should be in by default, if it isn't
      // already in a group
      const group = determineInitialGroupForItem(currentGroups, supportedFulfillmentTypes, item.shopId);

      if (!group) {
        // If no compatible group, add one with initially just this item in it
        didModifyGroups = true;
        currentGroups.push({
          _id: Random.id(),
          itemIds: [item._id],
          shopId: item.shopId,
          type: supportedFulfillmentTypes[0]
        });
      } else if (!group.itemIds) {
        // If there is a compatible group but it has no items array, add one with just this item in it
        didModifyGroups = true;
        group.itemIds = [item._id];
      } else if (group.itemIds.indexOf(item._id) === -1) {
        // If there is a compatible group with an items array but it is missing this item, add this item ID to the array
        didModifyGroups = true;
        group.itemIds.push(item._id);
      }
    });

    // Items may also have been removed. Need to remove their IDs from each group.itemIds
    currentGroups.forEach((group) => {
      group.itemIds = (group.itemIds || []).filter((itemId) => !!updatedCart.items.find((item) => item._id === itemId));
    });

    if (!didModifyGroups) return;

    const modifier = {
      $set: {
        shipping: currentGroups,
        updatedAt: new Date()
      }
    };

    const { modifiedCount } = await Cart.updateOne({ _id: updatedCart._id }, modifier);
    if (modifiedCount === 0) throw new ReactionError("server-error", "Failed to update cart");
  };

  appEvents.on("afterCartUpdate", handler);
  appEvents.on("afterCartCreate", handler);
}
