import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Query.sales"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of sales
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.shopId - limit to catalog items for these shops
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function sales(_, args, context) {
  const { shopId: opaqueShopId, ...connectionArgs } = args;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const query = await context.queries.sales(context, shopId, connectionArgs);

  console.log({ query });

  return getPaginatedResponse(query, connectionArgs);
}
