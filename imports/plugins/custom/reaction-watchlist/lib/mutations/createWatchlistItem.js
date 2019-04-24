import ReactionError from "@reactioncommerce/reaction-error";
import { WatchlistItemsCollection } from "../../lib/collections";

/**
 * @method createWatchlistItem
 * @summary Create a Watchlist Item
 * @param {Object} _context - unused (maintaining a pattern by keeping it here)
 * @param {Id} shopId - the Shop to which the Watchlist will belong
 * @param {Id} userId - the User to whom the Watchlist will belong
 * @param {String} watchlistId - unique Id for the watchlist to which this item belongs
 * @param {String} itemId - unique Id for this item
 * @param {Object} watchlistItemData - WatchlistItem Form Data (see: WatchlistItem Schema)
 * @return {Promise<Object>} A Watchlist object.
 */
export default async function createWatchlistItem(_context, shopId, userId, watchlistId, itemId, watchlistItemData) {
  if (!userId) {
    throw new ReactionError("invalid-parameter", "Missing user id");
  }

  const {
  // strip out any data that would override
    watchlist: watchlistIgnored,
    itemId: itemIdIgnored,
    shopId: shopIdIgnored,
    ...modifier
  } = watchlistItemData;

  const watchlist = watchlistId; // TODO: decode the watchlist id. (currently, the id is made up)

  const identifier = { shopId, userId, watchlist, itemId };

  const data = {
  // defaults
    isVisible: true,
    isDeleted: false,

    // user-provided data
    ...modifier,

    // overrides
    ...identifier,
    updatedAt: new Date()
  };

  WatchlistItemsCollection.simpleSchema(data).validate(data);

  await WatchlistItemsCollection.upsert(identifier, { $set: data });

  return WatchlistItemsCollection.findOne(identifier);
}
