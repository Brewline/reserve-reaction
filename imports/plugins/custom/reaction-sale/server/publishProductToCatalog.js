/**
 * @summary Publishes our plugin-specific product fields to the catalog
 * @param {Object} catalogProduct The catalog product that is being built. Should mutate this.
 * @param {Object} input Input data
 * @returns {undefined}
 */
export default function publishProductToCatalog(catalogProduct, { variants }) {
  catalogProduct.variants.forEach((catalogProductVariant) => {
    const unpublishedVariant =
      variants.find((v) => v._id === catalogProductVariant.variantId);

    if (unpublishedVariant && unpublishedVariant.saleId) {
      catalogProductVariant.saleId = unpublishedVariant.saleId;
    }
  });
}
