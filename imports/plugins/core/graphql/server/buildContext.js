import { curryN } from "ramda";
import hasPermission from "/imports/plugins/core/accounts/server/no-meteor/hasPermission";
import getShopIdForContext from "/imports/plugins/core/accounts/server/no-meteor/getShopIdForContext";

/**
 * @name buildContext
 * @method
 * @memberof GraphQL
 * @summary Mutates the provided context object, adding `user`, `userId`, `shopId`, and
 *   `userHasPermission` properties.
 * @returns {undefined} No return
 */
export default async function buildContext(context, user) {
  context.user = user || null;
  context.userId = (user && user._id) || null;

  // Add the shopId for this request, either from the authenticated user's preferences or based on the ROOT_URL domain name
  context.shopId = await getShopIdForContext(context);

  // Add a curried hasPermission tied to the current user (or to no user)
  context.userHasPermission = curryN(2, hasPermission)(context.user);
}
