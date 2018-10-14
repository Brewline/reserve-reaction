import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { Products, Shops } from "/lib/collections";
import { saveProductFromUntappd } from "@brewline/untappd/methods/import/products";
import { Sales } from "../../lib/collections";
import { getSale } from "./sales";

/**
 * @file Sale Products operations
 * @module reaction-sales
 */

export const SALES_PERMISSION = "createProduct"; // borrowing this for now

/**
 * Imports a product from Untappd and creates a Variant for this Sale
 *
 * @method updateSale
 * @param {String} saleId a Sale's _id
 * @param {Number} untappdProductId Untappd's beer.bid
 * @param {Array} optionsData array of options to create
 * (include title, price, inventoryLimit)
 * @returns {number} Number of products
 */
export function importUntappdSaleProduct(saleId, untappdProductId, optionsData = []) {
  check(saleId, String);
  check(untappdProductId, Number);
  check(optionsData, Array);

  // import untappd product, creating a variant with { saleId }
  const sale = Sales.findOne({ _id: saleId });

  if (!sale) {
    throw new Meteor.Error("not-found", `Sale not found for id '${saleId}'`);
  }

  const variantData = {
    title: sale.headline,
    saleId: sale._id
  };

  // returns a promise
  return saveProductFromUntappd(untappdProductId, variantData, optionsData);
}

const methods = {
  "Sales/addProduct"(saleId, productOrVariantId, shopId = Reaction.getShopId()) {
    const userId = Meteor.userId();

    if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return addSaleProduct(saleId, productOrVariantId, shopId);
  },

  async "Sales/importUntappdProduct"(saleId, untappdProductId, options) {
    check(saleId, String);
    check(untappdProductId, Number);
    check(options, Match.Maybe(Array));

    const userId = Meteor.userId();
    const sale = Sales.findOne({ _id: saleId });

    if (!sale) {
      throw new Meteor.Error("not-found", "Sale not found");
    }

    const { shopId } = sale;

    if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
      throw new Meteor.Error("access-denied", "Access denied");
    }

    const productIds = await importUntappdSaleProduct(saleId, untappdProductId, options);

    Logger.debug(`Products created: ${productIds}`);

    return productIds;
  }
};

Meteor.methods(methods);

// this is not a great subscription because updating the db, to, say, add a sale
// product will not be reflected in the result set. the Cursor may update but
// this method is not called again, therefore the set of saleVariantIds used to
// create the cursor in the first place will not be updated.
Meteor.publish("SaleProducts", (saleIdOrSlug, shopIdOrSlug = null) => {
  let shop;
  let shopId;
  const userId = Meteor.userId();

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
  } else {
    shopId = Reaction.getShopId();
  }

  if (!shopId) {
    return this.ready();
  }

  const sale = getSale(shopId, saleIdOrSlug, userId).fetch();

  // find all Variants having this saleId
  const variants = Products.find({
    saleId: sale._id
  }, { fields: { _id: 1, ancestors: 1 } }).fetch();

  const potentialTopLevelProductIds = _.chain(variants)
    .map((v) => v.ancestors)
    .flatten()
    .value();

  // find all top-level products for those variants?
  const variantIds = variants.map((v) => v._id);
  return Products.find({
    $or: [{ // top-level products for Sale Variants
      type: "simple",
      _id: { $in: potentialTopLevelProductIds }
    }, { // get the Sale Variants again
      _id: { $in: variantIds }
    }, { // options with Sale Variants
      type: "variant",
      ancestors: { $elemMatch: { $in: variantIds } }
    }]
  });
});

Meteor.publish("AllProducts", () => (
  Products.find({
    isDeleted: { $ne: true }, // by default, we don't publish deleted products
    isVisible: true, // by default, only lookup visible products
    shopId: Reaction.getShopId()
  })
));
