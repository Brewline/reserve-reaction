import { Sales } from "../collections";

/**
 * @name Query.saleBySlug
 * @method
 * @memberof Sale/GraphQL
 * @summary query the Sales collection and return sale data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.slug - slug of sale to query
 * @param {Object} _context - an object containing the per-request state
 * @return {Promise<Object>} sale object
 */
export default async function saleBySlug(_, { slug }, _context) {
  return Sales.findOne({ slug });
}
