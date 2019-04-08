import ReactionError from "@reactioncommerce/reaction-error";
import { WatchlistItems } from "../../lib/collections";

// There is no concept of a Watchlist as of 2019-04-01, only WatchlistItems.
// This query takes those items and rolls them up into a super-simple object
// something like { shopId, name }
export default function getWatchlist(shopId, name, _options) {
  const query = {
    isDeleted: false,
    isVisible: true,
    shopId,
    watchlist: name || null // observed in practice: `undefined` means this key is not set?
  };

  // check that it exists
  const foundWatchlistItem = WatchlistItems.findOne(query);

  if (!foundWatchlistItem) {
    throw new ReactionError("not-found", "Watchlist not found");
  }

  return { _id: name, shopId, name }; // return a super simple object
}
