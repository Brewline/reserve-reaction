import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import Logger from "@reactioncommerce/logger";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Catalog, Products, Shops } from "/lib/collections";
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
 * @param {Array} options array of options to create
 * (include title, price, inventoryLimit)
 * @returns {number} Number of products
 */
export async function importUntappdSaleProduct(saleId, untappdProductId, options = []) {
  check(saleId, String);
  check(untappdProductId, Number);
  check(options, Array);

  // import untappd product, creating a variant with { saleId }
  const sale = Sales.findOne({ _id: saleId });

  if (!sale) {
    throw new Meteor.Error("not-found", `Sale not found for id '${saleId}'`);
  }

  const productData = {
    weight: 2 // a cryptically-named UI setting
  };

  const variantData = {
    isVisible: false, // saleVariants are invisible
    title: sale.headline,
    saleId: sale._id
  };

  const optionsData = _.map(options, (option) => (
    {
      isVisible: false, // saleOptions are invisible
      ...option
    }
  ));

  const upsert = true;
  // returns a promise
  const productIds = await saveProductFromUntappd(
    untappdProductId,
    productData,
    variantData,
    optionsData,
    upsert
  );

  await Catalog.updateMany(
    { "product.productId": productIds },
    {
      saleId: sale._id,
      product: {
        isVisible: false // hide saleProducts from the standard Catalog
      }
    }
  );

  return productIds;
}

const methods = {
  // add a saleVariant/saleOption to an existing product
  "Sales/addProduct"(saleId, productOrVariantId, shopId = Reaction.getShopId()) {
    const userId = Meteor.userId();

    if (!Reaction.hasPermission(SALES_PERMISSION, userId, shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return addSaleProduct(saleId, productOrVariantId, shopId);
  },

  // import a saleProduct from Untappd and create it's saleVariant/saleOption
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

Meteor.publish("AllSaleProducts", (saleIdOrSlug, editMode, shopIdOrSlug = null) => {
  check(saleIdOrSlug, String);
  check(editMode, Boolean);
  check(shopIdOrSlug, Match.Maybe(String));

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

  const sale = getSale(shopId, saleIdOrSlug, userId);

  // there is a flaw in this query, but it's ok since it is for administrators
  // we are returning SaleVariants (great!), but all Products and all Options
  // (not great)
  const productsQuery = {
    isDeleted: { $ne: true },
    $or: [{
      type: "simple",
      isVisible: true
    }, {
      // sale variants are invisible
      type: "variant",
      $or: [{
        // saleVariants have a saleId
        saleId: sale._id || "nope!" // undefined turns this into an empty object?
      }, {
        // saleVariants are set to invisible, so return all non-sale variants
        // and all saleOptions
        isVisible: true
      }]
    }],
    shopId: Reaction.getShopId()
  };
  const productsCursor = Products.find(productsQuery);

  // only show products in the Catalog to non-shop admins
  const isShopAdmin = Reaction.hasPermission(
    SALES_PERMISSION,
    Meteor.userId(),
    Reaction.getShopId()
  );

  // return everything to admins in edit mode
  if (editMode && isShopAdmin) {
    return productsCursor;
  }

  // return only cataloged products for customers and non-edit mode admins
  const productsAndVariants = productsCursor.fetch();
  const saleVariants = productsAndVariants.filter((v) => (
    v.type === "variant" && v.saleId === sale._id
  ));
  const saleProductIds = _.chain(saleVariants)
    .map((v) => v.ancestors)
    .flatten()
    .uniq()
    .value();

  const catalogQuery = {
    "product._id": { $in: saleProductIds }
  };

  const catalogedProductIds =
    new Set(Catalog.find(catalogQuery).fetch().map((c) => c.product._id));
  const catalogedVariantIds = saleVariants.filter((v) => (
    v.ancestors.find((a) => catalogedProductIds.has(a))
  )).map((v) => v._id);

  const catalogedProductsQuery = {
    $or: [
      { _id: { $in: Array.from(catalogedProductIds) } }, // products
      { _id: { $in: catalogedVariantIds } }, // variants
      { ancestors: { $elemMatch: { $in: catalogedVariantIds } } } // options
    ]
  };

  return Products.find(catalogedProductsQuery);
});
