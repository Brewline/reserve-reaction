import Untappd from "node-untappd";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import Logger from "@reactioncommerce/logger";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { connectorsRoles } from "../../lib/roles";
import { getApiInfo } from "./api";

/**
 * @file Untappd connector wrapper for api calls for products
 *       wraps untappd product api calls in reaction methods
 * @module reaction-connectors-untappd
 */

export const methods = {
  /**
   * Gets a count of the products from Untappd with the API credentials setup for your store.
   *
   * @async
   * @method connectors/untappd/api/products/count
   * @param {object} options An object of options for the untappd API call. Available options here: https://help.untappd.com/api/reference/product#count
   * @returns {number} Number of products
   */
  async "connectors/untappd/api/products/count"(options) {
    check(options, Match.Maybe(Object));

    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    const apiCreds = getApiInfo();
    const untappd = new Untappd(apiCreds);
    const opts = Object.assign({}, { published_status: "published" }, { ...options }); // eslint-disable-line camelcase

    try {
      const count = await untappd.product.count(opts);
      return count;
    } catch (err) {
      Logger.error("Something went wrong during Untappd products count");
    }
  }
};

Meteor.methods(methods);
