import { notifyCreationOfWatchlistItem, processWatchlistItemNotifications } from "../../utils/notify";

/**
 * @name Query.removeWatchlistItem
 * @method
 * @memberof Watchlist/GraphQL
 * @summary Remove a Watchlist Item
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {String} args.watchlist - unique id for the watchlist to which this item belongs
 * @param {String} args.itemId - unique id for this item
 * @param {String} args.clientMutationId - An optional string identifying the
 * mutation call
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - sale belonging to this shop
 * @return {Promise<Object>} A Watchlist object
 */
export default async function removeWatchlistItem(_, args, context) {
  const { watchlist, itemId, clientMutationId } = args;
  const {
    alternateId,
    mutations,
    shopId,
    userId
  } = context;

  const updateCount = await mutations.removeWatchlistItem(
    context,
    shopId,
    userId || alternateId,
    watchlist,
    itemId
  );

  const fakeItem = {
    watchlist,
    itemId,
    displayName: `(removed from ${watchlist})`,
    createdAt: new Date()
  };
  notifyCreationOfWatchlistItem(
    "Down-vote Watchlist Item",
    "createWatchlistItem",
    fakeItem,
    { color: "#E01E5A" }
  );
  processWatchlistItemNotifications();

  return { wasRemoved: updateCount > 0, clientMutationId };
}
