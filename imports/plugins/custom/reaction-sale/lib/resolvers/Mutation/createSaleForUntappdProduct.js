import { decodeSaleOpaqueId } from "../../xforms/sale";

/**
 * @name Query.createSaleForUntappdProduct
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
export default async function createSaleForUntappdProduct(_, args, context) {
  let saleId;
  const { untappdId, saleData = {}, variantOptionsData } = args;
  const { shopId } = context;
  const { saleId: encodedSaleId } = saleData;

  if (encodedSaleId) {
    saleId = decodeSaleOpaqueId(encodedSaleId);
  }

  return context.mutations.createSaleForUntappdProduct(
    context,
    shopId,
    untappdId,
    { ...saleData, saleId },
    variantOptionsData
  );
}
