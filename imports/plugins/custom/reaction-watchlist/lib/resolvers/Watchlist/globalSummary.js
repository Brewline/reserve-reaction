import { getPaginatedAggregateResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name Watchlist.globalSummary
 * @method
 * @memberof WatchlistItems/GraphQL
 * @summary Get a product from Untappd
 * @param {Object} parentResult - a Watchlist object
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.watchlist - name of the watchlist
 * @param {Object} args.filters - query parameters
 * @param {Object} args.options - query options (limit, etc)
 * @param {Int} args.options.limit - limit to <limit> results, sorted by -count
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - watchlist items belonging to this shop
 * @return {Promise<Object>} A Shop object
 */
export default async function globalSummary(parentResult, args, context) {
  const { queries } = context;
  const { shopId, name: watchlist } = parentResult;
  const {
    filters = {},
    after,
    before,
    first,
    last
  } = args;

  const query = queries.globalWatchlistSummary(shopId, watchlist, filters);

  return getPaginatedAggregateResponse(query, { after, before, first, last });
}
