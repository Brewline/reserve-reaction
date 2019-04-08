/**
 * @name Query.untappdProducts
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product search result from Untappd
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.q - the query string to pass to Untappd
 * @param {Int} args.limit - the number of results to return (aka, page size)
 * @param {Int} args.offset - the number of pages to skip
 * @param {Object} context - unused
 * @return {Promise<Object>} A Product object
 */
export default async function untappdProducts(_, args, context) {
  const { q, limit, offset } = args;

  return context.queries.untappdProducts(q, limit, offset);
}
