import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name Query.watchlistUserItems
 * @method
 * @memberof WatchlistItems/GraphQL
 * @summary Get a product from Untappd
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.watchlistName - name of the watchlist
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.alternateId - client-provided unique id for the user
 * (useful for when the user is anonymous)
 * @param {Object} context.shopId - watchlist items belonging to this shop
 * @param {Object} context.userId - watchlist items belonging to this user
 * @return {Promise<Object>} A Shop object
 */
export default async function watchlistUserItems(_, args, context) {
  const {
    alternateId,
    queries,
    shopId,
    userId
  } = context;
  const { watchlistName } = args;

  const query =
    queries.userWatchlistItems(shopId, userId || alternateId, watchlistName);

  return getPaginatedResponse(query, args);
}
