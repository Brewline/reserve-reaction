import { encodeWatchlistOpaqueId as encodeOpaqueId } from "../../xforms/watchlist";
// import globalItems from "./globalItems";
import globalSummary from "./globalSummary";
import userItems from "./userItems";

export default {
  _id: (node) => encodeOpaqueId(node._id),
  // globalItems,
  summary: globalSummary,
  items: userItems
};
