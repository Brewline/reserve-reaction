import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Shops } from "/lib/collections";
import { Sales } from "../../lib/collections";

/**
 * @file Sales CRUD operations
 * @module reaction-sales
 */

export const SALES_PERMISSION = "createProduct"; // borrowing this for now

/**
 * Lists Sales
 *
 * @method listSales
 * @param {String} shopId shop for which this item should be added
 * @param {String} userId id of the user querying
 * @param {Object} filters e.g., { isVisible: false }
 * @param {Object} options e.g., { limit: 10 }
 * @returns {number} Number of products
 */
export function listSales(shopId, userId, filters = {}, options = {}) {
  let shopsFilter;
  const userFilter = {};

  check(shopId, String);
  check(filters, Match.Maybe(Object));
  check(options, Match.Maybe(Object));

  const primaryShopId = Reaction.getPrimaryShopId();

  if (shopId === primaryShopId) {
    const activeShopIds = Shops.find({
      $or: [
        { "workflow.status": "active" },
        { _id: primaryShopId }
      ]
    }, {
      fields: {
        _id: 1
      }
    }).fetch().map((activeShop) => activeShop._id);

    shopsFilter = {
      shopId: {
        $in: activeShopIds
      }
    };
  } else {
    shopsFilter = { shopId };
  }

  // TODO: if filters includes a shopId key, update shopsFilter with the
  // intersection of the two.

  if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
    userFilter.isVisible = true;
  }

  const query = Object.assign(
    {
      deletedAt: null
    },
    filters,
    shopsFilter,
    userFilter
  );

  return Sales.find(query, options);
}

/**
 * Gets a Sale
 *
 * @method getSale
 * @param {String} shopId shop for which this item should be added
 * @param {String} saleIdOrSlug sale id or slug to find
 * @param {String} userId (optional) when user is an admin, show hidden sales
 * @returns {number} Number of products
 */
export function getSale(shopId, saleIdOrSlug, userId) {
  check(shopId, String);
  check(saleIdOrSlug, String);

  const shopFilter = {
    $or: [
      { _id: saleIdOrSlug },
      { slug: saleIdOrSlug }
    ]
  };

  if (Reaction.getPrimaryShopId() !== shopId) {
    shopFilter.shopId = shopId;
  }

  if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
    shopFilter.isVisible = true;
  }

  return Sales.find(shopFilter);
}

/**
 * Updates a Sale
 *
 * @method updateSale
 * @param {String} saleId a Sale's _id
 * @param {String} shopId shop for which this item should be added
 * @param {object} data data used to create the watchlist
 * @returns {number} Number of products
 */
export function updateSale(saleId, shopId, data) {
  check(saleId, String);
  check(shopId, String);
  check(data, Object);

  const saleData = Object.assign({
    isVisible: true,
    deletedAt: null,
    createdAt: new Date(2000, 1, 1) // this is just to appease the validator
  }, data, { shopId });

  Sales.simpleSchema(saleData).validate(saleData);

  const sale = Sales.update({
    _id: saleId,
    shopId
  }, {
    $set: saleData
  });

  Logger.debug(`updated sale: ${sale}`);

  return sale;
}

/**
 * Insert a Sale
 *
 * @method insertSale
 * @param {String} shopId shop for which this item should be added
 * @param {object} data data used to create the watchlist
 * @returns {number} Number of products
 */
export function insertSale(shopId, data) {
  check(shopId, String);
  check(data, Object);

  const saleData = Object.assign({
    createdAt: new Date(2000, 1, 1), // these are just to appease the validator
    deletedAt: null,
    isDemo: false,
    isVisible: true
  }, data, { shopId });

  Sales.simpleSchema(saleData).validate(saleData);

  const sale = Sales.insert(saleData);

  Logger.debug(`created sale: ${sale}`);

  return sale;
}

/**
 * Removes an item from a watchlist
 *
 * @async
 * @method removeSale
 * @param {String} saleId a Sale's _id
 * @param {String} shopId shop for which this item should be added
 * @returns {number} Number of products
 */
export function removeSale(saleId, shopId) {
  check(saleId, String);
  check(shopId, String);

  const count = Sales.update({
    _id: saleId,
    shopId
  }, {
    $set: { deletedAt: new Date() }
  });

  // raise if no record was found

  if (count > 0) {
    Logger.debug(`removed sale: 'saleId: ${saleId}/shopId: ${shopId}'`);
  } else {
    Logger.warn(`failed to remove sale: 'saleId: ${saleId}/shopId: ${shopId}'`);
  }

  return count;
}

const methods = {
  "Sales/insert"(data) {
    const userId = Meteor.userId();
    let { shopId } = data;

    if (!shopId) {
      shopId = Reaction.getShopId();
    }

    if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return insertSale(shopId, data);
  },

  "Sales/update"(saleId, data) {
    const userId = Meteor.userId();
    let { shopId } = data;

    if (!shopId) {
      shopId = Reaction.getShopId();
    }

    if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return updateSale(saleId, shopId, data);
  },

  "Sales/save"(data) {
    const { _id } = data;

    if (_id) {
      return methods["Sales/update"](_id, data);
    }

    return methods["Sales/insert"](data);
  },

  "Sales/remove"(saleId, shopId = Reaction.getShopId()) {
    const userId = Meteor.userId();

    if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return removeSale(saleId, shopId);
  }
};

Meteor.methods(methods);

Meteor.publish("Sales", (filters = {}, options = {}) => {
  const shopId = Reaction.getShopId();
  const userId = Meteor.userId();

  if (!shopId) {
    return this.ready();
  }

  return listSales(shopId, userId, filters, options);
});

Meteor.publish("Sale", (saleIdOrSlug, shopIdOrSlug) => {
  let shop;
  let shopId = Reaction.getShopId();
  const userId = Meteor.userId();

  if (!shopId) {
    return this.ready();
  }

  if (shopIdOrSlug) {
    shop = Shops.findOne({
      $or: [
        { _id: shopIdOrSlug },
        { slug: shopIdOrSlug }
      ]
    });
  }

  if (shop) {
    shopId = shop._id;
  }

  return getSale(shopId, saleIdOrSlug, userId);
});
