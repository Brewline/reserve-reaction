import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name Watchlist.userItems
 * @method
 * @memberof WatchlistItems/GraphQL
 * @summary Get a product from Untappd
 * @param {Object} parentResult - a Watchlist object
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.watchlist - name of the watchlist
 * @param {Object} args.filters - query parameters
 * @param {Object} args.options - query options (limit, etc)
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.alternateId - client-provided unique id for the user
 * (useful for when the user is anonymous)
 * @param {Object} context.shopId - watchlist items belonging to this shop
 * @param {Object} context.userId - watchlist items belonging to this user
 * @return {Promise<Object>} A Shop object
 */
export default async function userItems(parentResult, args, context) {
  const {
    alternateId,
    queries,
    userId
  } = context;
  const { shopId, name: watchlist } = parentResult;

  const query =
    queries.userWatchlistItems(shopId, userId || alternateId, watchlist);

  return getPaginatedResponse(query, args);
}
