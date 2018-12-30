import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name Query.sales
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of sales
 * @param {Object} _ - unused
 * @param {ConnectionArgs} connectionArgs - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - limit sales to this shop
 * @return {Promise<Object>} A CatalogItemConnection object
 */
export default async function sales(_, connectionArgs, context) {
  let queryShopId;
  let queryOptions;
  const { collections, shopId } = context;

  const primaryShopId = await context.queries.primaryShopId(collections);

  if (shopId !== primaryShopId) {
    queryShopId = shopId;

    queryOptions = getDefaultOptionsForMarketplaceShop(context);
  } else {
    queryOptions = getDefaultOptionsForPrimaryShop(context);
  }

  const options = Object.assign(queryOptions, connectionArgs);
  const query = await context.queries.sales(context, queryShopId, options);

  return getPaginatedResponse(query, connectionArgs);
}

function getDefaultOptionsForMarketplaceShop(context) {
  const { shopId, userHasPermission } = context;

  return {
    shouldIncludeHidden: userHasPermission(["reaction-accounts"], shopId)
  };
}

function getDefaultOptionsForPrimaryShop(context) {
  const { shopId, userHasPermission } = context;

  return {
    shouldIncludeHidden: userHasPermission(["reaction-accounts"], shopId)
  };
}
