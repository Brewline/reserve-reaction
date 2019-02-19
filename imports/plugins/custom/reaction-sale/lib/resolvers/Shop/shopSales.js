import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name Query.shopSales
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of sales
 * @param {Object} parentResult - Shop
 * @param {ConnectionArgs} connectionArgs - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function shopSales(parentResult, connectionArgs, context) {
  const { _id: shopId } = parentResult;

  const query = await context.queries.sales(context, shopId, connectionArgs);

  return getPaginatedResponse(query, connectionArgs);
}
