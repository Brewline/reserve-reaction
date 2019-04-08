import ReactionError from "@reactioncommerce/reaction-error";
import { WatchlistItemsCollection } from "../../lib/collections";

/**
 * @method removeWatchlistItem
 * @summary Remove a Watchlist Item
 * @param {Object} _context - unused (maintaining a pattern by keeping it here)
 * @param {Id} shopId - the Shop to which the Watchlist will belong
 * @param {Id} userId - the User to whom the Watchlist will belong
 * @param {String} watchlistId - unique Id for the watchlist to which this item belongs
 * @param {String} itemId - unique Id for this item
 * @param {Object} watchlistItemData - WatchlistItem Form Data (see: WatchlistItem Schema)
 * @return {Promise<Int>} The number of items updated (hopefully 0 or 1).
 */
export default async function removeWatchlistItem(_context, shopId, userId, watchlistId, itemId) {
  if (!userId) {
    throw new ReactionError("invalid-parameter", "Missing user id");
  }

  const watchlist = watchlistId; // TODO: decode the watchlist id. (currently, the id is made up)

  const identifier = { shopId, userId, watchlist, itemId };

  return WatchlistItemsCollection.update(
    identifier,
    { $set: { isDeleted: true } },
    { upsert: false }
  );
}
