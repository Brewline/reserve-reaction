import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name Query.saleProducts
 * @method
 * @memberof Sale/GraphQL
 * @summary query the Sales collection and return sale data
 * @param {Object} parentResult - a Sale object
 * @param {Object} _args - from the request
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} sale object
 */
export default async function saleProducts(parentResult, _args, context) {
  const { _id: saleId, shopId } = parentResult;
  const { collections } = context;
  const { Catalog } = collections;

  if (!saleId) {
    throw new ReactionError("invalid-param", "You must provide a saleId");
  }

  const catalogItems = await Catalog.find({ saleId, shopId }).toArray();
  return catalogItems.map((c) => c.product);
}
