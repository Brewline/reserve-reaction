import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * Arguments passed by the client for a tags query
 * @typedef {ConnectionArgs} TagConnectionArgs - An object of all arguments that were sent by the client
 * @memberof Tag/GraphQL
 * @property {ConnectionArgs} args - An object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @property {Boolean} args.shouldIncludeDeleted - If set to true, include deleted. Default false.
 * @property {Boolean} args.isTopLevel - If set to a boolean, filter by this.
 * @property {String} args.shopId - The ID of shop to filter tags by
 * @property {Number} args.sortBy - Sort results by a TagSortByField enum value of `_id`, `name`, `position`, `createdAt`, `updatedAt`
 */

/**
 * @name Query.tags
 * @method
 * @memberof Tag/GraphQL
 * @summary Returns the tags for a shop
 * @param {Object} _ - unused
 * @param {TagConnectionArgs} connectionArgs - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tags(_, connectionArgs, context) {
  let dbShopId;

  const { shopId: requestShopId } = connectionArgs;
  const { userHasPermission, shopId: contextShopId } = context;

  if (requestShopId) {
    dbShopId = decodeShopOpaqueId(requestShopId);

    // ensure user has permission to query tags for this shop.
    // (for demo purposes. guest should always be true)
    const requiredPermissions = ["guest"];
    if (dbShopId !== contextShopId && !userHasPermission(requiredPermissions, dbShopId)) {
      throw new ReactionError("access-denied", "Access denied");
    }
  } else {
    dbShopId = contextShopId;
  }

  const query = await context.queries.tags(context, dbShopId, connectionArgs);

  return getPaginatedResponse(query, connectionArgs);
}
