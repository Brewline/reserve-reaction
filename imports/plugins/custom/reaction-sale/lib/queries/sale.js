import { decodeSaleOpaqueId } from "../xforms/sale";

import { Sales } from "../collections";

/**
 * @name Query.sale
 * @method
 * @memberof Sale/GraphQL
 * @summary query the Sales collection and return sale data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.id - ID of sale to query
 * @param {Object} _context - (unused) an object containing the per-request state
 * @return {Promise<Object>} sale object
 */
export default async function sale(_, { id }, _context) {
  const dbSaleId = decodeSaleOpaqueId(id);

  return Sales.findOne({ _id: dbSaleId });
}
