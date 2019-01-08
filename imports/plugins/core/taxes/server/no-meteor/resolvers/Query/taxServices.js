import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query.taxServices
 * @method
 * @memberof Taxes/GraphQL
 * @summary get all available tax services for a given shop
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - shop id for which to get tax services
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Array of tax services
 */
export default async function taxServices(_, { shopId }, context) {
  const dbShopId = decodeShopOpaqueId(shopId);
  return context.queries.taxServices(context, dbShopId);
}
