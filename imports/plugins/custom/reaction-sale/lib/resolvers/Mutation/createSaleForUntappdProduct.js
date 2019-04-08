import { decodeSaleOpaqueId } from "../../xforms/sale";

/**
 * @name Query.createSaleForUntappdProduct
 * @method
 * @memberof Catalog/GraphQL
 * @summary Create a Sale given an Untappd
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.untappdId: String or Int - Id from Untappd
 * @param {Object} args.saleData: Object - and additional Sale Data (e.g., beginsAt)
 * @param {Object} args.saleData.saleId: String - encoded sale._id
 * @param {Object} args.variantOptionsData: Object - and additional Variant Data (e.g., price)
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
