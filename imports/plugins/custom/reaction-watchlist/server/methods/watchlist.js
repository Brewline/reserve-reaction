import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { WatchlistItems } from "../../lib/collections";

/**
 * @file Watchlist CRUD operations
 * @module reaction-watchlist
 */

/**
 * Lists items in a watchlist
 *
 * @async
 * @method listWatchlistItems
 * @param {String} userId user for which this item should be added
 * @param {String} shopId shop for which this item should be added
 * @param {String} watchlist "Products", "Followers", etc
 * @param {Object} filters e.g., { isVisible: false }
 * @param {Object} options e.g., { limit: 10 }
 * @returns {number} Number of products
 */
export function listWatchlistItems(userId, shopId, watchlist, filters = {}, options = {}) {
  check(userId, String);
  check(shopId, String);
  check(watchlist, String);

  const query = Object.assign(
    {
      isDeleted: false,
      isVisible: true
    },
    filters,
    {
      userId,
      shopId,
      watchlist
    }
  );

  return WatchlistItems.find(query, options);
}

/**
 * Saves an item to a watchlist
 *
 * @async
 * @method addWatchlistItem
 * @param {String} userId user for which this item should be added
 * @param {String} shopId shop for which this item should be added
 * @param {String} watchlist "Products", "Followers", etc
 * @param {String} itemId the unique id for this data (i.e., the data source's id)
 * @param {object} data data used to create the watchlist
 * @returns {number} Number of products
 */
export function saveWatchlistItem(userId, shopId, watchlist, itemId, data) {
  check(userId, String);
  check(shopId, String);
  check(watchlist, String);
  check(itemId, String);
  check(data, Object);

  const watchlistData = Object.assign({
    isDeleted: false,
    isVisible: true,
    createdAt: new Date(2000, 1, 1) // this is just to appease the validator
  }, data, { userId, shopId, watchlist, itemId });

  WatchlistItems.simpleSchema(watchlistData).validate(watchlistData);

  const watchlistItem = WatchlistItems.upsert({
    userId,
    shopId,
    watchlist,
    itemId
  }, {
    $set: watchlistData
  });

  Logger.debug(`created watchlist item: ${watchlistItem}`);

  return watchlistItem;
}

/**
 * Removes an item from a watchlist
 *
 * @async
 * @method removeWatchlistItem
 * @param {String} userId user for which this item should be added
 * @param {String} shopId shop for which this item should be added
 * @param {String} watchlist "Products", "Followers", etc
 * @param {String} _idOrItemId identifier
 * @returns {number} Number of products
 */
export function removeWatchlistItem(userId, shopId, watchlist, _idOrItemId) {
  check(userId, String);
  check(shopId, String);
  check(watchlist, String);
  check(_idOrItemId, String);

  const count = WatchlistItems.update({
    userId,
    shopId,
    watchlist,
    $or: [
      { _id: _idOrItemId },
      { itemId: _idOrItemId }
    ]
  }, {
    $set: { isDeleted: true }
  });

  // raise if no record was found

  if (count > 0) {
    Logger.debug(`removed watchlist item: '${_idOrItemId}'`);
  } else {
    Logger.warn(`failed to remove watchlist item: '${_idOrItemId}'`);
  }

  return count;
}

Meteor.methods({
  "watchlist/save"(watchlist, itemId, data) {
    const userId = Meteor.userId();
    const shopId = Reaction.getShopId();

    return saveWatchlistItem(userId, shopId, watchlist, itemId, data);
  },
  "watchlist/remove"(watchlist, _idOrItemId) {
    return removeWatchlistItem(Meteor.userId(), Reaction.getShopId(), watchlist, _idOrItemId);
  }
});

Meteor.publish("WatchlistItems", (watchlist, filters = {}, options = {}) => (
  listWatchlistItems(Meteor.userId(), Reaction.getShopId(), watchlist, filters, options)
));
