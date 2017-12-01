import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Products } from "/lib/collections";
import { registerSchema } from "/imports/plugins/core/collections";

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
    type: Number,
    optional: true,
    decimal: false
  }
});

registerSchema("UntappdProduct", UntappdProduct);

Products.attachSchema(UntappdProduct, { selector: { type: "simple" } });
Products.attachSchema(UntappdProduct, { selector: { type: "variant" } });
