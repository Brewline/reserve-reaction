import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name "Query.surcharges"
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the surcharges GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - The shop that owns these surcharges
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>|undefined} A Surcharge object
 */
export default async function surcharges(parentResult, args, context) {
  const { shopId, ...connectionArgs } = args;

  const cursor = await context.queries.surcharges(context, {
    shopId: decodeShopOpaqueId(shopId)
  });

  return getPaginatedResponse(cursor, connectionArgs);
}
