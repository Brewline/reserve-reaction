import getProductQuantity from "./getProductQuantity";

/**
 * @method isSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array with top-level variants
 * @return {Boolean} true if quantity is zero.
 */
export default function isSoldOut(variants) {
  const results = variants.map((variant) => {
    const quantity = getProductQuantity(variant, variants);
    return variant.inventoryManagement && quantity <= 0;
  });
  return results.every((result) => result);
}
