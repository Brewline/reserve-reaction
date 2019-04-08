/**
 * @name Query.untappdShops
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a shop search result from Untappd
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.q - the query string to pass to Untappd
 * @param {Int} args.limit - the number of results to return (aka, page size)
 * @param {Int} args.offset - the number of pages to skip
 * @param {Object} context - unused
 * @return {Promise<Object>} A Shop object
 */
export default async function untappdShops(_, args, context) {
  const { q, limit, offset } = args;

  return context.queries.untappdShops(q, limit, offset);
}
