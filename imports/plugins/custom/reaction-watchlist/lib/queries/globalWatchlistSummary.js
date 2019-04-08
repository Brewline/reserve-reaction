import { WatchlistItems } from "../../lib/collections";

// returns an object with keys collection & pipeline, primarily so that the
// result may be passed directly to `getPaginatedAggregateResponse`, however, to
// execute directly:
// const { collection, pipeline } = globalWatchlistSummary(...)
// collection.aggregate(pipeline);
export default function globalWatchlistSummary(shopId, watchlist, filters = {}) {
  const query = {
    // these come before the spread to act as default values, which may be
    // overridden with the filters requested
    isDeleted: false,
    isVisible: true,

    ...filters,

    // these come after the spread to ensure no games are being played in the
    // request
    shopId,
    watchlist
  };

  return {
    collection: WatchlistItems,
    pipeline: [
      { $match: query },
      {
        $group: {
          _id: {
            watchlist: "$watchlist",
            itemId: "$itemId",
            displayName: "$displayName",
            label: "$label"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]
  };
}
