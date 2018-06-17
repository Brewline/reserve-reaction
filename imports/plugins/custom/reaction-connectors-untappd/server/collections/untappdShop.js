import SimpleSchema from "simpl-schema";
import { Shop } from "/lib/collections/schemas/shops";
import { registerSchema } from "@reactioncommerce/schemas";

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

Shop.extend(UntappdShop);
