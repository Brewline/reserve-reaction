import UntappdClient from "node-untappd";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { check, Match } from "meteor/check";
import { Accounts, Shops } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

import {
  createReactionShopDataFromUntappdShop,
  hackRestoreAddressBook,
  importUntappdShop,
  setShopImage,
  untappdShopExists
} from "@brewline/untappd-connector/server/methods/import/shops";

function saveUntappdShop(untappdShop) {
  if (untappdShopExists(untappdShop.brewery_id)) {
    const msg = `Shop (${untappdShop.brewery_name}) already exists`;
    Logger.warn(msg);
    throw new Meteor.Error(400, msg);
  }

  // Setup reaction product
  const shopData = createReactionShopDataFromUntappdShop(untappdShop);

  Meteor.call("shop/createShop", Meteor.userId(), shopData);

  const shop = Shops.findOne({ name: shopData.name });

  hackRestoreAddressBook(shop, shopData)

  setShopImage(shop, untappdShop);

  Logger.debug(`Shop ${untappdShop.brewery_name} added`);

  return shop;
}

Meteor.methods({
  "onboarding/updateWorkflow"(currentStatus, completedStatuses = []) {
    check(currentStatus, String);
    check(completedStatuses, Match.Maybe([String]));
    // this.unblock();

    if (!completedStatuses || !completedStatuses.length) {
      completedStatuses = [currentStatus];
    }

    const result = Accounts.update(Meteor.userId(), {
      $set: {
        "onboarding.status": currentStatus
      },
      $addToSet: {
        "onboarding.workflow": { $each: completedStatuses }
      }
    });

    // TODO: error handling?

    return result;
  },

  "onboarding/createUntappdShop"(untappdShopId) {
    check(untappdShopId, Number);
    // this.unblock();

    return importUntappdShop(untappdShopId, saveUntappdShop);
  },

  async "onboarding/breweryBeerList"(untappdBreweryId) {
    let breweryId;

    check(untappdBreweryId, Match.Maybe(Number));

    if (untappdBreweryId) {
      breweryId = untappdBreweryId;
    } else {
      // TODO: implement Reaction.getShop()
      const shopId = Reaction.getShopId();
      const shop = Shops.findOne(shopId);
      ({ UntappdId: breweryId } = shop);
    }

    if (!breweryId) {
      throw new Meteor.Error(404, "Brewery not found");
    }

    // if (!Reaction.hasPermission(connectorsRoles)) {
    //   throw new Meteor.Error(403, "Access Denied");
    // }

    const { ServiceConfiguration } = Package['service-configuration'];

    const config =
      ServiceConfiguration.configurations.findOne({ service: 'untappd' });

    if (!config) {
      throw new ServiceConfiguration.ConfigError();
    }

    const debug = false;
    const untappd = new UntappdClient(debug);
    untappd.setClientId(config.clientId);
    untappd.setClientSecret(config.secret);
    // untappd.setAccessToken(accessToken);

    const opts = { BREWERY_ID: breweryId };

    const result = await new Promise((resolve, reject) => {
      try {
        untappd.breweryBeerList((error, data) => {
          if (error) {
            reject(error);
          } else if (!data || !data.response || !data.response.beers) {
            reject("No beers found for brewery");
          } else {
            resolve(data.response.beers.items);
          }
        }, opts);
      } catch (error) {
        Logger.error("There was a problem searching Untappd", error);
        reject(error);
      }
    });

    return result;
  }
});
