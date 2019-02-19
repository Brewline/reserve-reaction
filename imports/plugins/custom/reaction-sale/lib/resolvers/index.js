import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Mutation from "./Mutation";
import Query from "./Query";
import Sale from "./Sale";
import Shop from "./Shop";

/**
 * Sale-related GraphQL resolvers
 * @namespace Sales/GraphQL
 */

export default {
  Mutation,
  Query,
  Sale,
  Shop,
  ...getConnectionTypeResolvers("Sale")
};
