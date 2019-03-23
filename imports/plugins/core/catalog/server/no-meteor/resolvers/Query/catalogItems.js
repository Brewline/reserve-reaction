import { getPaginatedResponse, getPaginatedAggregateResponse } from "@reactioncommerce/reaction-graphql-utils";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name "Query.catalogItems"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of catalogItems
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.shopIds - limit to catalog items for these shops
 * @param {Array} args.tagIds - limit to catalog items with this array of tags
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function catalogItems(_, args, context) {
  const { shopIds: opaqueShopIds, tagIds: opaqueTagIds, ...connectionArgs } = args;

  const shopIds = opaqueShopIds && opaqueShopIds.map(decodeShopOpaqueId);
  const tagIds = opaqueTagIds && opaqueTagIds.map(decodeTagOpaqueId);

  if (connectionArgs.sortBy === "featured") {
    if (!tagIds || tagIds.length === 0) {
      throw new ReactionError("not-found", "A tag ID is required.");
    }
    if (tagIds.length > 1) {
      throw new ReactionError("invalid-parameter", "Multiple tags cannot be sorted by featured. Only the first tag will be returned.");
    }
    const tagId = tagIds[0];
    const aggregationParams = await context.queries.catalogItemsAggregate(context, {
      shopIds,
      tagId
    });
    return getPaginatedAggregateResponse(aggregationParams, connectionArgs);
  }

  if (connectionArgs.sortBy === "minPrice") {
    if (typeof connectionArgs.sortByPriceCurrencyCode !== "string") {
      throw new Error("sortByPriceCurrencyCode is required when sorting by minPrice");
    }
    connectionArgs.sortBy = `product.pricing.${connectionArgs.sortByPriceCurrencyCode}.minPrice`;
  }

  const query = await context.queries.catalogItems(context, {
    shopIds,
    tagIds
  });

  return getPaginatedResponse(query, connectionArgs);
}
