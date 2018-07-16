import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";

/**
 * @file Untappd connector api methods and helpers
 * @module reaction-connectors-untappd
 */

/**
 * @method getApiInfo
 * @summary - get Untappd Api Key, Password and Domain from the Untappd Connect package with the supplied shopId or alternatively the active shopId. should only be used from authenticated methods within the reaction-connectors-untappd plugin
 * @private
 * @param  {string} [shopId=Reaction.getShopId()] Optional shopId to get the API info for. Defaults to current shop.
 * @return {object} Untappd API connection information
 */
export function getApiInfo(shopId = Reaction.getShopId()) {
  const untappdPkg = Reaction.getPackageSettingsWithOptions({
    shopId,
    name: "reaction-connectors-untappd"
  });

  if (!untappdPkg) {
    throw new Meteor.Error("server-error", `No untappd package found for shop ${Reaction.getShopId()}`);
  }

  const { settings } = untappdPkg;

  return {
    apiKey: settings.apiKey,
    password: settings.password,
    shopName: settings.shopName
  };
}
