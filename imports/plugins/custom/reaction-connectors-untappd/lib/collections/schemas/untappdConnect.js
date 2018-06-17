import SimpleSchema from "simpl-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @file UntappdProduct
 *
 * @module reaction-connectors-untappd
 */

/**
 * @name UntappdConnectPackageConfig
 * @type {SimpleSchema}
 * @property {String} settings.apiKey Untappd API key
 * @property {String} settings.password Untappd API password
 * @property {String} settings.sharedSecret Untappd API shared secret
 * @property {String} settings.shopName Shop slug
 */
export const UntappdConnectPackageConfig = PackageConfig.clone().extend({
  "settings.apiKey": {
    type: String,
    label: "API key",
    optional: true
  },
  "settings.password": {
    type: String,
    label: "API password",
    optional: true
  },
  "settings.sharedSecret": {
    type: String,
    label: "API shared secret",
    optional: true
  },
  "settings.shopName": {
    type: String,
    label: "Shop slug",
    optional: true
  }
});

registerSchema("UntappdConnectPackageConfig", UntappdConnectPackageConfig);
