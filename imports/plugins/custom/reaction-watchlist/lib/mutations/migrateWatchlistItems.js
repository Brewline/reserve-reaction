import ReactionError from "@reactioncommerce/reaction-error";
import { WatchlistItemsCollection } from "../../lib/collections";

/**
 * @method migrateWatchlistItems
 * @summary Migrate all Watchlist Items
 * Useful when the items were created for an anonymous user who becomes
 * identified
 * @param {Object} _context - unused (maintaining a pattern by keeping it here)
 * @param {Id} shopId - the Shop to which the Watchlist will belong
 * @param {Id} userId - the User to whom the Watchlist will belong
 * @param {Id} previousUserId - current owner of the items
 * @return {Promise<Object>} A Watchlist object.
 */
export default async function migrateWatchlistItems(_context, shopId, userId, previousUserId) {
  if (userId === previousUserId) { return 0; }
  if (!userId) {
    throw new ReactionError("invalid-parameter", "Missing user id");
  }
  if (!previousUserId) {
    throw new ReactionError("invalid-parameter", "Missing previous user id");
  }

  const updated = await WatchlistItemsCollection.update({
    shopId,
    userId: previousUserId
  }, {
    $set: { userId }
  });

  return updated;
}
