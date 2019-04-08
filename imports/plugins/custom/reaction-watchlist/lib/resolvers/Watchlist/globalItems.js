import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name Watchlist.globalItems
 * @method
 * @memberof WatchlistItems/GraphQL
 * @summary Get a product from Untappd
 * @param {Object} parentResult - a Watchlist object
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.watchlist - name of the watchlist
 * @param {Object} args.filters - query parameters
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - watchlist items belonging to this shop
 * @return {Promise<Object>} A Shop object
 */
export default async function globalItems(parentResult, args, context) {
  const { queries } = context;
  const { shopId, name: watchlist } = parentResult;
  const {
    filters = {}
  } = args;

  const query = queries.globalWatchlistItems(shopId, watchlist, filters);

  return getPaginatedResponse(query, args);
}
