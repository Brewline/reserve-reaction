/**
 * @name Query.untappdShop
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product from Untappd
 * @param {Object} _ - unused
 * @param {Int} untappdId - Untappd Brewery Id
 * @param {Object} context - unused
 * @return {Promise<Object>} A Shop object
 */
export default async function untappdShop(_, untappdId, context) {
  return context.queries.untappdShop(untappdId);
}
