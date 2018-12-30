import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

function productsOptionsAndVariantsForSale(collections, shopId, saleId) {
  const { Products } = collections;

  // get all products, all options, and saleVariants
  const productsOptionsAndSaleVariantsQuery = {
    shopId,
    $or: [{
      type: "simple", // TODO: CONSTANT
      isVisible: true
    }, {
      // sale variants are invisible
      type: "variant", // TODO: CONSTANT
      $or: [{
        // saleVariants have a saleId
        saleId
      }, {
        // saleVariants are set to invisible, so return all non-sale variants
        // and all saleOptions
        isVisible: true
      }]
    }]
  };

  return Products.find(productsOptionsAndSaleVariantsQuery).toArray();
}

function normalizeProductsAndVariants(productsAndVariants) {
  const products = productsAndVariants.filter((p) => p.type === "simple"); // TODO: CONSTANT

  products.forEach((product) => {
    // alternative to having business logic here, we could check that the
    // ancestor array equals -- not includes, _equals_ -- [product._id]
    product.variants = productsAndVariants
      .filter((v) => v.saleId) // Variants have SaleId, Options do not
      .filter((v) => v.ancestors.includes(product._id));

    product.variants.forEach((variant) => {
      variant.options = productsAndVariants
        .filter((o) => o.ancestors.includes(variant._id));
    });
  });

  return products;
}

/**
 * @name Query.saleProducts
 * @method
 * @memberof Sale/GraphQL
 * @summary query the Sales collection and return sale data
 * @param {Object} parentResult - a Sale object
 * @param {Object} args - from the request
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} sale object
 */
export default async function saleProducts(parentResult, args, context) {
  const { _id: saleId, shopId } = parentResult;
  const { collections } = context;
  // const { Catalog, Products } = collections;
  const { Products } = collections;

  if (!saleId) {
    throw new ReactionError("invalid-param", "You must provide a saleId");
  }

  const productsOptionsAndSaleVariants =
    await productsOptionsAndVariantsForSale(collections, shopId, saleId);

  const saleVariants = productsOptionsAndSaleVariants
    .filter((v) => v.type === "variant" && v.saleId === saleId);
  const saleProductIds = _.chain(saleVariants)
    .map((v) => v.ancestors)
    .flatten()
    .uniq()
    .value();
  const saleProductIdSet = new Set(saleProductIds);

  // const catalogQuery = {
  //   "product._id": { $in: saleProductIds }
  // };

  // const catalogedProducts = await Catalog.find(catalogQuery).toArray();
  // const catalogedProductIds =
  //   new Set(catalogedProducts.map((c) => c.product._id));
  const catalogedVariantIds = saleVariants.filter((v) => (
    // v.ancestors.find((a) => catalogedProductIds.has(a))
    v.ancestors.find((a) => saleProductIdSet.has(a))
  )).map((v) => v._id);

  const productsAndVariantsQuery = {
    $or: [
      // products
      // { _id: { $in: Array.from(catalogedProductIds) } },
      { _id: { $in: saleProductIds } },
      // variants
      { _id: { $in: catalogedVariantIds } },
      // options
      { ancestors: { $elemMatch: { $in: catalogedVariantIds } } }
    ]
  };

  const productsAndVariants =
    await Products.find(productsAndVariantsQuery).toArray();

  return normalizeProductsAndVariants(productsAndVariants);
}
