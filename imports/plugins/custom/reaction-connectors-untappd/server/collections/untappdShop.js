import SimpleSchema from "simpl-schema";
import { Shops } from "/lib/collections";
import { registerSchema } from "/imports/plugins/core/collections";

/**
 * @file UntappdShop
 *
 * @module reaction-connectors-untappd
 */

/**
 * @name UntappdShop
 * @summary UntappdShop schema attached to Shops
 * @type {SimpleSchema}
 * @property {Number} UntappdId Untappd ID
 */
export const UntappdShop = new SimpleSchema({
  UntappdId: {
    type: SimpleSchema.Integer,
    optional: true
  },
  UntappdResource: {
    type: Object,
    optional: true,
    blackbox: true
  },
  url: {
    type: String,
    optional: true
  }
});

registerSchema("UntappdShop", UntappdShop);

Shops.attachSchema(UntappdShop);
