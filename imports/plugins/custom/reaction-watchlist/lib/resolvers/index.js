// import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Mutation from "./Mutation";
import Query from "./Query";
import Watchlist from "./Watchlist";
import WatchlistItemSummary from "./WatchlistItemSummary";

/**
 * Untappd-related GraphQL resolvers
 * @namespace Watchlist/GraphQL
 */

export default {
  Mutation,
  Query,
  Watchlist,
  WatchlistItemSummary
  // ...getConnectionTypeResolvers("WatchlistItem")
};
