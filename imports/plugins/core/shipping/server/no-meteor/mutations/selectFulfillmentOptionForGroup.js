import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import getCartById from "../util/getCartById";

const inputSchema = new SimpleSchema({
  cartId: String,
  cartToken: {
    type: String,
    optional: true
  },
  fulfillmentGroupId: String,
  fulfillmentMethodId: String
});

/**
 * @method selectFulfillmentOptionForGroup
 * @summary Selects a fulfillment option for a fulfillment group
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.cartId - The ID of the cart to select a fulfillment option for
 * @param {String} [input.cartToken] - The token for the cart, required if it is an anonymous cart
 * @param {String} input.fulfillmentGroupId - The group to select a fulfillment option for
 * @param {String} input.fulfillmentMethodId - The fulfillment method ID from the option the shopper selected
 * @return {Promise<Object>} An object with a `cart` property containing the updated cart
 */
export default async function selectFulfillmentOptionForGroup(context, input) {
  const cleanedInput = inputSchema.clean(input || {});
  inputSchema.validate(cleanedInput);

  const { cartId, cartToken, fulfillmentGroupId, fulfillmentMethodId } = cleanedInput;
  const { appEvents, collections, userId } = context;
  const { Cart } = collections;

  const cart = await getCartById(context, cartId, { cartToken, throwIfNotFound: true });

  const fulfillmentGroup = (cart.shipping || []).find((group) => group._id === fulfillmentGroupId);
  if (!fulfillmentGroup) throw new ReactionError("not-found", `Fulfillment group with ID ${fulfillmentGroupId} not found in cart with ID ${cartId}`);

  // Make sure there is an option for this group that has the requested ID
  const option = (fulfillmentGroup.shipmentQuotes || []).find((quote) => quote.method._id === fulfillmentMethodId);
  if (!option) throw new ReactionError("not-found", `Fulfillment option with method ID ${fulfillmentMethodId} not found in cart with ID ${cartId}`);

  const { matchedCount } = await Cart.updateOne({
    "_id": cartId,
    "shipping._id": fulfillmentGroupId
  }, {
    $set: {
      "shipping.$.shipmentMethod": option.method
    }
  });
  if (matchedCount !== 1) throw new ReactionError("server-error", "Unable to update cart");

  // We can do the same update locally to avoid a db find
  cart.shipping.forEach((group) => {
    if (group._id === fulfillmentGroupId) {
      group.shipmentMethod = option.method;
    }
  });

  await appEvents.emit("afterCartUpdate", {
    cart,
    updatedBy: userId
  });

  return { cart };
}
