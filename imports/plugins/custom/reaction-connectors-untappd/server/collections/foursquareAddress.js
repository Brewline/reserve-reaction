import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Address } from "/lib/collections";
import { registerSchema } from "/imports/plugins/core/collections";

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
    type: Number,
    optional: true,
    decimal: false
  },
  FoursquareUrl: {
    type: String,
    optional: true
  }
});

registerSchema("FoursquareAddress", FoursquareAddress);
