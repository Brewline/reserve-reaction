import SimpleSchema from "simpl-schema";
import { Products } from "/lib/collections";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @file UntappdProduct
 *
 * @module reaction-connectors-untappd
 */

/**
 * @name UntappdProduct
 * @summary UntappdProduct schema attached to Products type "simple" and "variant"
 * @type {SimpleSchema}
 * @property {Number} UntappdId Untappd ID
 */
export const UntappdProduct = new SimpleSchema({
  UntappdId: {
    type: SimpleSchema.Integer,
    optional: true
  },
  UntappdResource: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

registerSchema("UntappdProduct", UntappdProduct);

Products.attachSchema(UntappdProduct, { selector: { type: "simple" } });
Products.attachSchema(UntappdProduct, { selector: { type: "variant" } });
