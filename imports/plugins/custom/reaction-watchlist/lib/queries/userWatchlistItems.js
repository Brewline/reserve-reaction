import { WatchlistItems } from "../../lib/collections";

export default function userWatchlistItems(shopId, userId, watchlist, filters = {}, options = {}) {
  const query = {
    // these come before the spread to act as default values, which may be
    // overridden with the filters requested
    isDeleted: false,
    isVisible: true,

    ...filters,

    // these come after the spread to ensure no games are being played in the
    // request
    shopId,
    userId,
    watchlist
  };

  // TODO: validate options

  return WatchlistItems.find(query, options);
}
