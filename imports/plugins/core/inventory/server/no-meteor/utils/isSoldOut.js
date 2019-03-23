/**
 * @method isSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array with top-level variants
 * @return {Boolean} true if quantity is zero.
 */
export default function isSoldOut(variants) {
  return variants.every((variant) => variant.inventoryManagement && variant.inventoryAvailableToSell <= 0);
}
