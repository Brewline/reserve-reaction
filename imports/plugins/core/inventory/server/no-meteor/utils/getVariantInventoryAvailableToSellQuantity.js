import getVariants from "/imports/plugins/core/catalog/server/no-meteor/utils/getVariants";

/**
 *
 * @method getVariantInventoryAvailableToSellQuantity
 * @summary Get the number of product variants still avalible to sell. This calculates based off of `inventoryAvailableToSell`.
 * This function can take only a top level variant object and a mongo collection as params to return the product
 * variant quantity. This method can also take a top level variant, mongo collection and an array of
 * product variant options as params to skip the db lookup and return the variant quantity
 * based on the provided options.
 * @param {Object} variant - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @return {Promise<number>} Variant quantity.
 */
export default async function getVariantInventoryAvailableToSellQuantity(variant, collections, variants) {
  let options;
  if (variants) {
    options = variants.filter((option) => option.ancestors[1] === variant._id);
  } else {
    options = await getVariants(variant._id, collections);
  }

  if (options && options.length) {
    return options.reduce((sum, option) => sum + option.inventoryAvailableToSell || 0, 0);
  }
  return variant.inventoryAvailableToSell || 0;
}
