import getProductQuantity from "./getProductQuantity";

/**
 * @method isBackorder
 * @summary If all the products variants have inventory policy disabled, inventory management enabled and a quantity of zero return `true`
 * @memberof Catalog
 * @param {Object[]} variants - Array with product variant objects
 * @return {boolean} is backorder allowed or not for a product
 */
export default function isBackorder(variants) {
  const results = variants.map((variant) => {
    const quantity = getProductQuantity(variant, variants);
    return !variant.inventoryPolicy && variant.inventoryManagement && quantity === 0;
  });
  return results.every((result) => result);
}
