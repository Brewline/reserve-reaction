import SimpleSchema from "simpl-schema";
import { Products } from "/lib/collections";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name SaleVariant
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} saleId Sale Id
 */
export const SaleVariant = new SimpleSchema({
  saleId: {
    type: String,
    label: "Sale Id",
    optional: true
  }
});

registerSchema("SaleVariant", SaleVariant);

Products.attachSchema(SaleVariant, { selector: { type: "variant" } });
