import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
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
export default async function shopSale(_, args, context) {
  let shopSlugOrId;
  let saleSlugOrId;
  const {
    shopSlugOrId: shopSlugOrEncodedId,
    saleSlugOrId: saleSlugOrEncodedId
  } = args;
  const { collections, shopId } = context;
  const { Shops } = collections;

  try {
    saleSlugOrId = decodeSaleOpaqueId(saleSlugOrEncodedId);
  } catch (_e) { // this is somewhat expected when decoding
    saleSlugOrId = saleSlugOrEncodedId;
  }

  const primaryShopId = await context.queries.primaryShopId(collections);

  // if you are on a non-primary shop and try to request a sale that does not
  // belong to you, ignore the requested shop and use self.
  if (shopId !== primaryShopId) {
    shopSlugOrId = shopId;
  } else {
    try {
      shopSlugOrId = decodeShopOpaqueId(shopSlugOrEncodedId);
    } catch (_e) { // this is somewhat expected when decoding
      const shop = await Shops.findOne({ slug: shopSlugOrEncodedId });
      shopSlugOrId = shop._id;
    }
  }

  return context.queries.sale(context, shopSlugOrId, saleSlugOrId);
}
