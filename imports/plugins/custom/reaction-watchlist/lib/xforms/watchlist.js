import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import {
  assocInternalId,
  assocOpaqueId,
  decodeOpaqueIdForNamespace,
  encodeOpaqueId
} from "@reactioncommerce/reaction-graphql-xforms/id";

namespaces.Watchlist = "reaction/watchlist";

export const assocWatchlistInternalId = assocInternalId(namespaces.Watchlist);
export const assocWatchlistOpaqueId = assocOpaqueId(namespaces.Watchlist);
export const decodeWatchlistOpaqueId = decodeOpaqueIdForNamespace(namespaces.Watchlist);
export const encodeWatchlistOpaqueId = encodeOpaqueId(namespaces.Watchlist);
