import _ from "lodash";
import UntappdClient from "node-untappd";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts, Shops } from "/lib/collections";
import Logger from "@reactioncommerce/logger";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { saveWatchlistItem } from "@brewline/watchlist/server/methods/watchlist";
import { WatchlistItemsCollection } from "@brewline/watchlist/lib/collections";

import {
  createReactionShopDataFromUntappdShop,
  hackRestoreAddressBook,
  importUntappdShop,
  setShopImage,
  untappdShopExists,
  updateShopSocialPackage
} from "@brewline/untappd-connector/server/methods/import/shops";
import scrubUntappdBrewery from "@brewline/untappd-connector/lib/scrubUntappdBrewery";

export function saveUntappdShopFunctionGenerator(userId) {
  return (untappdShop) => {
    if (untappdShopExists(untappdShop.brewery_id)) {
      const msg = `Shop (${untappdShop.brewery_name}) already exists`;
      Logger.warn(msg);
      throw new Meteor.Error(400, msg);
    }

    // Setup reaction product
    const shopData = createReactionShopDataFromUntappdShop(untappdShop);

    Meteor.call("shop/createShop", userId, shopData);

    const shop = Shops.findOne({ name: shopData.name });

    hackRestoreAddressBook(shop, shopData);
    updateShopSocialPackage(shop);

    setShopImage(shop, untappdShop);

    Logger.debug(`Shop ${untappdShop.brewery_name} added`);

    return shop;
  };
}

function addUntappdShopToWaitlist(untappdShop) {
  const userId = Meteor.userId();
  const shopId = Reaction.getPrimaryShopId();
  const itemId = String(untappdShop.brewery_id);
  const displayName = untappdShop.brewery_name;
  const label = untappdShop.brewery_label;
  const watchlistItem = {
    itemMetadata: scrubUntappdBrewery(untappdShop),
    displayName,
    label
  };

  return saveWatchlistItem(userId, shopId, "Breweries", itemId, watchlistItem);
}

export function transferFavorites(previousUserId, currentUserId = Meteor.userId()) {
  check(previousUserId, String);
  check(currentUserId, String);

  if (previousUserId === currentUserId) { return; } // should this raise?

  const msg =
    `Transferring WatchlistItems from '${previousUserId}' to '${currentUserId}'`;
  Logger.warn(msg);

  return WatchlistItemsCollection.update({
    userId: previousUserId
  }, {
    $set: {
      userId: currentUserId
    }
  }, {
    multi: true
  });
}

Meteor.methods({
  "onboarding/updateWorkflow"(currentStatus, providedCompletedStatuses = []) {
    check(currentStatus, String);
    check(providedCompletedStatuses, Match.Maybe([String]));

    let completedStatuses;

    if (!providedCompletedStatuses || !providedCompletedStatuses.length) {
      completedStatuses = [currentStatus];
    } else {
      completedStatuses = providedCompletedStatuses;
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

    const fnSaveUntappdShop = saveUntappdShopFunctionGenerator(Meteor.userId());

    return importUntappdShop(untappdShopId, fnSaveUntappdShop);
  },

  "onboarding/addUntappdShopToWaitlist"(untappdShopId) {
    check(untappdShopId, Number);
    // this.unblock();

    return importUntappdShop(untappdShopId, addUntappdShopToWaitlist);
  },

  // both params are optional
  async "onboarding/breweryBeerList"(pUntappdBreweryId, pFilters) {
    let breweryId;
    let filters;
    let untappdBreweryId;

    // since the first param is optional, pUntappdBreweryId could contain the
    // desired filters
    check(pUntappdBreweryId, Match.Maybe(Match.OneOf(Number, Object)));
    check(pFilters, Match.Maybe(Object));

    if (_.isObject(pUntappdBreweryId)) {
      filters = pUntappdBreweryId;
      untappdBreweryId = undefined;
    } else {
      filters = pFilters;
      untappdBreweryId = pUntappdBreweryId;
    }

    if (untappdBreweryId) {
      breweryId = untappdBreweryId;
    } else {
      // TODO: implement Reaction.getShop()
      const shopId = Reaction.getShopId();
      const shop = Shops.findOne(shopId);
      ({ UntappdId: breweryId } = shop);
    }

    if (!breweryId) {
      throw new Meteor.Error(404, "Unable to get beer list from Untappd");
    }

    // if (!Reaction.hasPermission(connectorsRoles)) {
    //   throw new Meteor.Error(403, "Access Denied");
    // }

    const { ServiceConfiguration } = Package["service-configuration"];

    // TODO: add `shopId: Reaction.getPrimaryShop()` to query?
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

    const opts = { ...filters, BREWERY_ID: breweryId };

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
  },

  "onboarding/transferFavorites"(previousUserId) {
    check(previousUserId, String);
    // this.unblock();

    return transferFavorites(previousUserId, Meteor.userId());
  }
});
