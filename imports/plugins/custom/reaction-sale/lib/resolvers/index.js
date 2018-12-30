import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Query from "./Query";
import Sale from "./Sale";

/**
 * Sale-related GraphQL resolvers
 * @namespace Sales/GraphQL
 */

export default {
  Query,
  Sale,
  ...getConnectionTypeResolvers("Sale")
};
