import {
  notifyCreationOfWatchlistItem,
  processWatchlistItemNotifications
} from "../../utils/notify";

/**
 * @name Query.createWatchlistItem
 * @method
 * @memberof Watchlist/GraphQL
 * @summary Create a Watchlist Item
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by
 * the client
 * @param {String} args.watchlist - unique id for the watchlist to which this
 * item belongs
 * @param {String} args.itemId - unique id for this item
 * @param {Object} args.watchlistItemData - watchlist item
 * @param {String} args.clientMutationId - An optional string identifying the
 * mutation call
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - sale belonging to this shop
 * @return {Promise<Object>} A Watchlist object
 */
export default async function createWatchlistItem(_, args, context) {
  const { watchlist, itemId, watchlistItemData = {}, clientMutationId } = args;
  const {
    alternateId,
    mutations,
    request: { ip } = {},
    shopId,
    userId
  } = context;

  const metadata = {
    ip // get from request
  };

  const item = await mutations.createWatchlistItem(
    context,
    shopId,
    userId || alternateId,
    watchlist,
    itemId,
    { ...watchlistItemData, metadata }
  );

  notifyCreationOfWatchlistItem(
    "Up-vote Watchlist Item",
    "createWatchlistItem",
    item,
    { color: "#2EB67D" }
  );
  processWatchlistItemNotifications();

  return { item, clientMutationId };
}
