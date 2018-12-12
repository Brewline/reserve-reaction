import { Sales } from "../collections";

/**
 * @name sales
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Sales collection by shop ID and optionally by isTopLevel
 * @param {Object} _context - an object containing the per-request state
 * @param {String} shopId - ID of shop to query
 * @param {Object} [options] - Additional options for the query
 * @param {Boolean} [options.shouldIncludeDemo] - Whether or not to include `isDemo=true` sales. Default is `false`
 * @param {Boolean} [options.shouldIncludeDeleted] - Whether or not to include `isDeleted=true` sales. Default is `false`
 * @param {Boolean} [options.shouldIncludeHidden] - Whether or not to include `isVisible=false` sales. Default is `false`
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function sales(_context, shopId, options = {}) {
  const {
    shouldIncludeDemo = false,
    shouldIncludeDeleted = false,
    shouldIncludeHidden = false
  } = options;

  const query = { shopId };

  if (shouldIncludeDemo !== true) {
    query.isDemo = { $eq: false };
  }
  if (shouldIncludeDeleted !== true) {
    query.deletedAt = { $eq: null };
  }
  if (shouldIncludeHidden !== true) {
    query.isVisible = { $eq: true };
  }

  return Sales.rawCollection().find(query);
}
