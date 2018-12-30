import { decodeSaleOpaqueId } from "../../xforms/sale";

/**
 * @name Query.sale
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a list of sales
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.slugOrId: String - sale corresponding to this id or slug
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - sale belonging to this shop
 * @return {Promise<Object>} A Sale object
 */
export default async function sale(_, args, context) {
  let slugOrId;
  const { slugOrId: slugOrEncodedId } = args;
  const { shopId } = context;

  try {
    slugOrId = decodeSaleOpaqueId(slugOrEncodedId);
  } catch (_e) { // this is somewhat expected when decoding
    slugOrId = slugOrEncodedId;
  }

  return context.queries.sale(context, shopId, slugOrId);
}
