/**
 *
 * @method getVariants
 * @summary Get all of a Product's Variants or only a Product's top level Variants.
 * @param {string} productOrVariantId - A Product or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @param {boolean} topOnly - True to return only a products top level variants.
 * @return {Promise<Object[]>} Array of Product Variant objects.
 */
export default async function getVariants(productOrVariantId, collections, topOnly) {
  const { Products } = collections;

  return Products.find({
    ancestors: topOnly ? [productOrVariantId] : productOrVariantId,
    type: "variant",
    isVisible: true,
    isDeleted: { $ne: true }
  }).toArray();
}
