/* eslint camelcase: 0 */
import _ from "lodash";
import UntappdClient from "node-untappd";
import { Job } from "/imports/plugins/core/job-collection/lib";
// import { methods as RegistryMethods } from "/server/methods/core/registry";
import { Meteor } from "meteor/meteor";
import { Logger, Reaction } from "/server/api";
import { check, Match } from "meteor/check";
import { Shops, Jobs, Packages } from "/lib/collections";
import { connectorsRoles } from "../../lib/roles";
import { importShopImages } from "../../jobs/image-import";

import { getSlug } from "/lib/api";

// function requestUntappdCredential(options, fnCallback) {
//   const untappdService = Package["brewline:accounts-untappd"].Untappd;

//   untappdService.requestCredential(options, fnCallback);
// }

/**
 * @file Untappd connector import product method
 *       contains methods and helpers for setting up and removing synchronization between
 *       a Untappd store and a Reaction shop
 * @module reaction-connectors-untappd
 */

/**
 * Transforms a Untappd shop into a Reaction shop.
 * @private
 * @method createReactionShopDataFromUntappdShop
 * @param  {object} untappdShop the Untappd shop object
 * @return {object} An object that fits the `Product` schema
 *
 * @todo consider abstracting private Untappd import helpers into a helpers file
 */
export function createReactionShopDataFromUntappdShop(untappdShop) {
  if (!untappdShop || !untappdShop.brewery_id) { return; } // raise?

  const primaryShop = Reaction.getPrimaryShop();

  const slug = getSlug(_.get(untappdShop, "claimed_status.claimed_slug") || untappdShop.brewery_slug);

  const emails = [{ address: `${slug}@brewline.io` }];

  // if (untappdShop.owner)

  const addressBook = [];

  if (untappdShop.location) {
    addressBook.push({
      fullName: `${untappdShop.brewery_name} HQ`,
      address1: untappdShop.location.brewery_address || "123 Brew Ln.",
      city: untappdShop.location.brewery_city,
      company: untappdShop.brewery_name,
      region: untappdShop.location.brewery_state,
      country: "US", // I know, I know
      phone: "2125551212", // required...
      postal: "10004", // required...
      isCommercial: true,
      isBillingDefault: true,
      isShippingDefault: true
    });
  }

  _.each(_.get(untappdShop, "locations.items", []), (item) => {
    const venue = _.get(item, "venue", {});
    const location = _.get(venue, "location");

    if (!location) { return; }

    const address = {
      fullName: venue.venue_name,
      address1: location.venue_address || "123 Brew Ln.",
      city: location.venue_city,
      company: untappdShop.brewery_name,
      region: location.venue_state || "ME",
      country: "US", // I know, I know
      phone: "2125551212", // required...
      postal: "10004", // required...
      isCommercial: true,
      isBillingDefault: false,
      isShippingDefault: false
    };

    if (venue.foursquare) {
      address.FoursquareId = venue.foursquare.foursquare_id;
      address.FoursquareUrl = venue.foursquare.foursquare_url;
    }

    addressBook.push(address);
  });

  const reactionShop = Object.assign({}, primaryShop, {
    slug,
    merchantShops: null,
    shopType: "merchant",
    name: untappdShop.brewery_name,
    description: untappdShop.brewery_description,
    addressBook,
    domains: [
      `${slug}.brewline.io`, // primary
      Reaction.getDomain()
    ],
    emails,
    // timezone: , // infer from current IP?
    metafields: [],
    active: true,
    workflow: {
      status: "new"
    },

    UntappdId: untappdShop.brewery_id,
    UntappdResource: untappdShop
  });

  delete reactionShop._id;

  // TODO: anything useful here?
  // // Add untappd options to meta fields as is.
  // if (Array.isArray(untappdProduct.options)) {
  //   untappdProduct.options.forEach((option) => {
  //     reactionProduct.metafields.push({
  //       scope: "untappd",
  //       key: option.name,
  //       value: option.values.join(", "),
  //       namespace: "options"
  //     });
  //   });
  // }

  // scrub the data and apply any default
  return Shops.simpleSchema().clean(reactionShop);
}

/**
 * Creates a new job to save an image from a given url
 * Saves an image from a url to the Collection FS image storage location
 * (default: Mongo GridFS)
 * @private
 * @method saveImage
 * @param  {string}  shopId the shop's id
 * @param  {string}  url url of the image to save
 * @param  {object}  metadata metadata to save with the image
 * @param  {string}  [brandAssetType] when set, this image will be set as the
 *                   Shop's navbarBrandImage, for example
 * @return {undefined}
 */
function saveImage(shopId, url, metadata) {
  new Job(Jobs, "connectors/untappd/import/shop/image", {
    shopId,
    url,
    metadata
  }).priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    }).save();
}

export function untappdShopExists(UntappdId) {
  return Shops.findOne({ UntappdId }, { fields: { _id: 1 } });
}

export function setShopImage(reactionShop, untappdShop) {
  // Save the primary image to the grid and as priority 0
  saveImage(reactionShop._id, untappdShop.brewery_label, {
    type: "brandAsset",
    ownerId: Meteor.userId(),
    shopId: reactionShop._id
  });
}

// it's a little annoying, but addressBook is wiped, so let's add it back
export function hackRestoreAddressBook(shop, shopData) {
  if (!shop) { return; }

  Shops.update(shop._id, {
    $set: {
      addressBook: shopData.addressBook
    }
  });
}

export function updateShopSocialPackage(shop) {
  if (!_.get(shop, "UntappdResource.contact")) { return false; }
  const shopSocialSettings = shop.UntappdResource.contact;
  const { twitter, facebook, instagram } = shopSocialSettings;

  const apps = {};

  // we could loop here, but where sometimes we have a URL and other times a
  // a handle, let's do it manually
  apps.twitter = {
    username: twitter,
    profilePage: `https://twitter.com/${twitter}`,
    enabled: !!twitter
  };

  const facebookHandle = facebook.replace(/^.*\.facebook\.com\//i, "");
  apps.facebook = {
    username: facebookHandle,
    profilePage: facebook,
    enabled: !!facebookHandle
  };

  apps.instagram = {
    username: instagram,
    profilePage: `https://www.instagram.com/${instagram}/`,
    enabled: !!instagram
  };

  const { brewery_page_url: breweryPageUrl } = shop.UntappdResource;
  const untappdHandle = breweryPageUrl.replace(/^\//i, "");
  apps.untappd = {
    username: untappdHandle,
    profilePage: `https://untappd.com${breweryPageUrl}`,
    enabled: !!instagram
  };

  Packages.update({
    name: "reaction-social",
    shopId: shop._id
  }, {
    $set: {
      "settings.public.apps": apps
    }
  });
}

function saveShop(untappdShop, ownerEmailAddress) {
  if (untappdShopExists(untappdShop.brewery_id)) {
    const msg = `Shop (${untappdShop.brewery_name}) already exists`;
    Logger.warn(msg);
    throw new Meteor.Error(400, msg);
  }

  // Setup reaction product
  const shopData = createReactionShopDataFromUntappdShop(untappdShop);
  const ownerData = {
    email: ownerEmailAddress || `${shopData.slug}@brewline.io`,
    name: shopData.name
  };

  Meteor.call("accounts/inviteShopOwner", ownerData, shopData);

  const shop = Shops.findOne({ name: shopData.name });

  hackRestoreAddressBook(shop, shopData);
  updateShopSocialPackage(shop);

  setShopImage(shop, untappdShop);

  Logger.debug(`Shop ${untappdShop.brewery_name} added`);

  return shop;
}

export async function importUntappdShop(untappdShopId, fnSaveShop = saveShop, ...fnSaveShopArgs) {
  try {
    const { ServiceConfiguration } = Package["service-configuration"];

    const config =
      ServiceConfiguration.configurations.findOne({ service: "untappd" });

    if (!config) {
      throw new ServiceConfiguration.ConfigError();
    }

    const debug = false;
    const untappd = new UntappdClient(debug);
    untappd.setClientId(config.clientId);
    untappd.setClientSecret(config.secret);

    // in case you need to add additional options
    const opts = { BREWERY_ID: untappdShopId };

    const result = {};

    await new Promise((resolve, reject) => {
      try {
        untappd.breweryInfo(Meteor.bindEnvironment((error, data) => {
          if (error) {
            reject(error);
          } else {
            const shop = fnSaveShop(data.response.brewery, ...fnSaveShopArgs);

            result.shop = shop;

            resolve(shop);
          }
        }), opts);
      } catch (error) {
        Logger.error(`There was a problem querying Untappd for id '${untappdShopId}'`, error);
        reject(error);
      }
    });

    importShopImages();
    return result.shop;
  } catch (error) {
    Logger.error("There was a problem importing your shop from Untappd", error);
    throw new Meteor.Error("There was a problem importing your shop from Untappd", error);
  }
}

export const methods = {
  /**
   * Imports & create a shop from Untappd.
   *
   * @async
   * @method connectors/untappd/import/shops
   * @param {string} untappdShopId Untappd shop id
   * @param {string} ownerEmailAddress User who will be the owner and will
   * receive the welcome email
   * @returns {object} A shop
   */
  async "connectors/untappd/import/shops"(untappdShopId, ownerEmailAddress) {
    check(untappdShopId, Match.Maybe(Number));
    check(ownerEmailAddress, Match.Maybe(String));

    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return importUntappdShop(untappdShopId, saveShop, ownerEmailAddress);
  },

  /**
   * Searches shops from Untappd
   *
   * @async
   * @method connectors/untappd/search/shops
   * @param {object} options An object of options for the untappd API call. Available options here: https://help.untappd.com/api/reference/product#index
   * @returns {array} An array of the Reaction product _ids (including variants and options) that were created.
   */
  async "connectors/untappd/search/shops"(options) {
    check(options, Match.Maybe(Object));

    const { ServiceConfiguration } = Package["service-configuration"];

    const config =
      ServiceConfiguration.configurations.findOne({ service: "untappd" });

    if (!config) {
      throw new ServiceConfiguration.ConfigError();
    }

    const debug = false;
    const untappd = new UntappdClient(debug);
    untappd.setClientId(config.clientId);
    untappd.setClientSecret(config.secret);
    // untappd.setAccessToken(accessToken);

    // in case you need to add additional options
    const opts = Object.assign({}, { ...options });

    const result = await new Promise((resolve, reject) => {
      try {
        untappd.brewerySearch((error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        }, opts);
      } catch (error) {
        Logger.error("There was a problem searching Untappd", error);
        reject(error);
      }
    });

    return result;
  }
};

Meteor.methods(methods);
