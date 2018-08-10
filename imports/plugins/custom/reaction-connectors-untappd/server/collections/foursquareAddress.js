import SimpleSchema from "simpl-schema";
// import { Address } from "/lib/collections";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @file FoursquareAddress
 *
 * @module reaction-connectors-untappd
 */

/**
 * @name FoursquareAddress
 * @summary FoursquareAddress schema attached to Shops
 * @type {SimpleSchema}
 * @property {Number} UntappdId Untappd ID
 */
export const FoursquareAddress = new SimpleSchema({
  FoursquareId: {
    type: SimpleSchema.Integer,
    optional: true
  },
  FoursquareUrl: {
    type: String,
    optional: true
  }
});

registerSchema("FoursquareAddress", FoursquareAddress);
