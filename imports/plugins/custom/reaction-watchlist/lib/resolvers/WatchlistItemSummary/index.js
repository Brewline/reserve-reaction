import { encodeWatchlistOpaqueId as encodeOpaqueId } from "../../xforms/watchlist";

export default {
  // it is not correct to use encodeWatchlistOpaqueId here, but this isn't a
  // real _id anyway
  _id: ({ _id }) => encodeOpaqueId(JSON.stringify(_id)),

  watchlist: ({ _id: { watchlist } }) => watchlist,

  itemId: ({ _id: { itemId } }) => itemId,

  displayName: ({ _id: { displayName } }) => displayName,

  label: ({ _id: { label } }) => label
};
