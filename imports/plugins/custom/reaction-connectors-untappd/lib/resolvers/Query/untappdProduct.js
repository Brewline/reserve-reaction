/**
 * @name Query.untappdProduct
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product from Untappd
 * @param {Object} _ - unused
 * @param {Int} untappdId - Untappd Beer Id
 * @param {Object} context - unused
 * @return {Promise<Object>} A Sale object
 */
export default async function untappdProduct(_, untappdId, context) {
  return context.queries.untappdProduct(untappdId);
}
