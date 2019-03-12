import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Cart as CartSchema } from "/imports/collections/schemas";
import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @summary Copy items from an anonymous cart into a new account cart, and then delete the
 *   anonymous cart.
 * @param {String} accountId The account ID to associate with the new account cart
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {MongoDB.Collection} Cart The Cart collection
 * @param {String} shopId The shop ID to associate with the new account cart
 * @return {Object} The new account cart
 */
export default async function convertAnonymousCartToNewAccountCart({
  accountId,
  anonymousCart,
  anonymousCartSelector,
  Cart,
  shopId,
  userId
}) {
  const createdAt = new Date();
  const currencyCode = anonymousCart.currencyCode || "USD";
  const newCart = {
    _id: Random.id(),
    accountId,
    anonymousAccessToken: null,
    currencyCode,
    createdAt,
    items: anonymousCart.items,
    shopId,
    updatedAt: createdAt,
    workflow: {
      status: "new"
    }
  };

  CartSchema.validate(newCart);

  const { result } = await Cart.insertOne(newCart);
  if (result.ok !== 1) throw new ReactionError("server-error", "Unable to create account cart");

  await appEvents.emit("afterCartCreate", {
    cart: newCart,
    createdBy: userId
  });

  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new ReactionError("server-error", "Unable to delete anonymous cart");

  return newCart;
}
