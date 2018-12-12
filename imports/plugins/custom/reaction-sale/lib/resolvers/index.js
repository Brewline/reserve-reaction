import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Query from "./Query";

/**
 * Sale-related GraphQL resolvers
 * @namespace Sales/GraphQL
 */

export default {
  Query,
  ...getConnectionTypeResolvers("Sale")
};
