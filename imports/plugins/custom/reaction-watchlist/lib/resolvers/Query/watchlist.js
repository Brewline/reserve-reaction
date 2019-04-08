/**
 * @name Query.watchlist
 * @method
 * @memberof WatchlistItems/GraphQL
 * @summary Get a product from Untappd
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.watchlist - name of the watchlist
 * @param {Object} args.options - query options (limit, etc)
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - watchlist items belonging to this shop
 * @return {Promise<Object>} A Shop object
 */
export default async function getWatchlist(_, args, context) {
  const { queries, shopId } = context;
  const { name } = args;

  const $options = {/* limit */};

  return queries.watchlist(shopId, name, $options);
}
