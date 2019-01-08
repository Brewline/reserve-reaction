import SimpleSchema from "simpl-schema";
import { Catalog } from "/lib/collections";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name SaleCatalog
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} saleId Sale Id
 */
export const SaleCatalog = new SimpleSchema({
  saleId: {
    type: String,
    optional: true,
    label: "Sale Id"
  }
});

registerSchema("SaleCatalog", SaleCatalog);

Catalog.attachSchema(SaleCatalog);
