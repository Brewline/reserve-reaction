import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeFulfillmentRestrictionOpaqueId } from "../../xforms/flatRateFulfillmentRestriction";

/**
 * @name "Query.getFlatRateFulfillmentRestriction"
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the getFlatRateFulfillmentRestriction GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - The shop that owns this restriction
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>|undefined} A Restriction object
 */
export default async function getFlatRateFulfillmentRestriction(parentResult, args, context) {
  const { restrictionId, shopId } = args;

  return context.queries.getFlatRateFulfillmentRestriction(context, {
    restrictionId: decodeFulfillmentRestrictionOpaqueId(restrictionId),
    shopId: decodeShopOpaqueId(shopId)
  });
}
