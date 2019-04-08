/**
 * @name Query.migrateWatchlistItems
 * @method
 * @memberof Watchlist/GraphQL
 * @summary Migrate all Watchlist Items from one user to the current user
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by
 * the client
 * @param {String} args.clientMutationId - An optional string identifying the
 * mutation call
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - sale belonging to this shop
 * @return {Promise<Object>} A Watchlist object
 */
export default function migrateWatchlistItems(_, args, context) {
  const { clientMutationId } = args;
  const {
    alternateId,
    mutations,
    shopId,
    userId
  } = context;

  const items =
    mutations.migrateWatchlistItems(context, shopId, userId, alternateId);

  return { items, clientMutationId };
}
