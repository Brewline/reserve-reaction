import { Sales } from "../collections";

/**
 * @name Query.sale
 * @method
 * @memberof Sale/GraphQL
 * @summary query the Sales collection and return sale data
 * @param {Object} _context - an object containing the per-request state
 * @param {Object} shopId - sale belonging to this shop
 * @param {String} slugOrId - slug or ID of sale to query
 * @return {Promise<Object>} sale object
 */
export default async function sale(_context, shopId, slugOrId) {
  const query = {
    $or: [
      { _id: slugOrId },
      { slug: slugOrId }
    ]
  };

  if (shopId) {
    query.shopId = shopId;
  }

  return Sales.findOne(query);
}
