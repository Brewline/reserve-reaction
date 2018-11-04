import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name "Query.catalogItems"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of catalogItems
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.shopIds - limit to catalog items for these shops
 * @param {Object} args.tagIds - limit to catalog items with these tags
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function catalogItems(_, args, context) {
  const { shopIds: opaqueShopIds, tagIds: opaqueTagIds, ...connectionArgs } = args;

  if (connectionArgs.sortBy === "minPrice") {
    if (typeof connectionArgs.sortByPriceCurrencyCode !== "string") {
      throw new Error("sortByPriceCurrencyCode is required when sorting by minPrice");
    }
    connectionArgs.sortBy = `product.pricing.${connectionArgs.sortByPriceCurrencyCode}.minPrice`;
  }

  const shopIds = opaqueShopIds && opaqueShopIds.map(decodeShopOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  const query = await context.queries.catalogItems(context, {
    shopIds,
    tagIds
  });

  return getPaginatedResponse(query, connectionArgs);
}
