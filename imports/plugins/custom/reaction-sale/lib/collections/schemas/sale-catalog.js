import {
  CatalogProduct,
  CatalogVariantSchema
} from "/imports/collections/schemas";
/**
 * @name SaleCatalog
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {[String]} saleIds Sale Ids
 */
export const SaleCatalogProductExtension = {
  "saleIds": {
    type: Array,
    label: "Sale Ids",
    optional: true
  },

  "saleIds.$": {
    type: String,
    label: "Sale Id",
    optional: true
  }
};

CatalogProduct.extend(SaleCatalogProductExtension);

/**
 * @name SaleCatalogVariant
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} saleId Sale Id
 */
export const SaleCatalogVariantExtension = {
  saleId: {
    type: String,
    label: "Sale Id",
    optional: true
  }
};

CatalogVariantSchema.extend(SaleCatalogVariantExtension);
