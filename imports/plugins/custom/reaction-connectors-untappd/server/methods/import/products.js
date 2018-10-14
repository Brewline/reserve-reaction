/* eslint camelcase: 0 */
import _ from "lodash";
import moment from "moment";
import UntappdClient from "node-untappd";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { check, Match } from "meteor/check";
import { Products, Jobs, Tags } from "/lib/collections";
import { connectorsRoles } from "../../lib/roles";
import { importProductImages } from "../../jobs/image-import";

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
 * Transforms a Untappd product into a Reaction product.
 * @private
 * @method createReactionProductFromUntappdProduct
 * @param  {object} untappdProduct the Untappd product object
 * @param  {object} productData override any default product data
 * @return {object} An object that fits the `Product` schema
 *
 * @todo consider abstracting private Untappd import helpers into a helpers file
 */
function createReactionProductFromUntappdProduct(untappdProduct, productData = {}) {
  const reactionProduct = {
    ancestors: [],
    createdAt: new Date(),
    description: untappdProduct.beer_description,
    handle: untappdProduct.beer_slug,
    isDeleted: false,
    isVisible: true,
    metafields: [],
    pageTitle: untappdProduct.beer_style,
    price: { range: "0" },
    productType: untappdProduct.beer_style,
    requiresShipping: false,
    template: "productDetailSimple",
    title: untappdProduct.beer_name,
    type: "simple",
    updatedAt: new Date(),
    vendor: untappdProduct.brewery.brewery_name,
    workflow: {
      status: "new",
      workflow: ["imported"]
    },
    skipRevision: true,
    UntappdId: untappdProduct.bid,
    UntappdResource: untappdProduct,
    ...productData
  };

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

  return reactionProduct;
}

/**
 * Transforms a Untappd variant into a Reaction variant.
 * @private
 * @method createReactionVariantFromUntappdVariant
 * @param  {object} untappdVariant variant data
 * @return {object} An object that fits the `ProductVariant` schema
 */
function createReactionVariantFromUntappdVariant(untappdVariant) {
  const reactionVariant = {
    compareAtPrice: untappdVariant.compare_at_price, // can't remember what's up with this
    // height: 0,
    inventoryManagement: true,
    inventoryQuantity: 0,
    inventoryPolicy: true, // do not allow backorder
    isDeleted: false,
    isVisible: true,
    length: 0,
    metafields: [],
    optionTitle: untappdVariant.title,
    price: { range: "0" },
    requiresShipping: false,
    taxable: true,
    taxCode: "0000",
    type: "variant",
    // weight: normalizeWeight(untappdVariant.grams),
    // weightInGrams: untappdVariant.grams,
    // width: 0,
    workflow: {
      status: "synced",
      workflow: ["imported"]
    },
    skipRevision: true,
    UntappdId: null,
    ...untappdVariant
  };

  if (untappdVariant.inventoryLimit > 0) {
    reactionVariant.inventoryLimit = untappdVariant.inventoryLimit;
    reactionVariant.lowInventoryWarningThreshold =
      10 * untappdVariant.inventoryLimit;
  }

  if (untappdVariant.price) {
    reactionVariant.price = parseFloat(untappdVariant.price);
  }

  return reactionVariant;
}

/**
 * cache all existing tags to memory {slug => id} so that when we're importing products we can
 * lookup tags without a database call.
 * @method createTagCache
 * @private
 * @return {object} Dictionary of tag slugs mapping to the associated _id
 * @todo: For apps with large collections of tags (5k+), this may be less desirable than checking each tag against mongo
 *        That would cause each product tag we find to hit the database at least once. We could make this optional
 */
function createTagCache() {
  return Tags.find({}).fetch().reduce((cache, tag) => {
    if (!cache[tag.slug]) {
      cache[tag.slug] = tag._id;
    }
    return cache;
  }, {});
}

/**
 * Creates a new job to save an image from a given url
 * Saves an image from a url to the Collection FS image storage location
 * (default: Mongo GridFS)
 * @private
 * @method saveImage
 * @param  {string}  url url of the image to save
 * @param  {object}  metadata metadata to save with the image
 * @return {undefined}
 */
function saveImage(url, metadata) {
  new Job(Jobs, "connectors/untappd/import/product/image", { url, metadata })
    .priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    }).save();
}

export function saveSimpleProduct(untappdProduct, productData = {}) {
  const shopId = Reaction.getShopId();
  const tagCache = createTagCache();

  // Get tags from untappd and register them if they don't exist.
  // push tag Id's into our hashtags array for use in the product
  // We can't load all tags beforehand because Untappd doesn't have a tags API
  const untappdTags = [untappdProduct.beer_style];

  const hashtags = _.chain(untappdTags)
    .filter(_.identity)
    .map((tag) => {
      const normalizedTag = {
        name: tag,
        slug: Reaction.getSlug(tag),
        shopId,
        isTopLevel: false,
        updatedAt: new Date(),
        createdAt: new Date()
      };

      // If we have a cached tag for this slug, we don't need to create a new one
      if (!tagCache[normalizedTag.slug]) {
        // this tag doesn't exist, create it, add it to our tag cache
        normalizedTag._id = Tags.insert(normalizedTag);
        tagCache[normalizedTag.slug] = normalizedTag._id;
      }
      // push the tag's _id into hashtags from the cache
      return tagCache[normalizedTag.slug];
    })
    .value();

  // Setup reaction product
  const reactionProduct =
    createReactionProductFromUntappdProduct(untappdProduct, {
      hashtags,
      shopId,
      ...productData
    });

  // Insert product, save id
  return Products.insert(
    reactionProduct,
    { selector: { type: "simple" }, publish: true }
  );
}

export function saveUntappdProductImage(untappdProduct, shopId, reactionProductId) {
  // Save the primary image to the grid and as priority 0
  const labelUrl = untappdProduct.beer_label_hd || untappdProduct.beer_label;
  if (!labelUrl) { return false; }

  saveImage(labelUrl, {
    ownerId: Meteor.userId(),
    productId: reactionProductId,
    variantId: reactionProductId,
    shopId,
    priority: 0,
    toGrid: 1
  });

  return true;
}

const defaultOptions = [
  { title: "4 Pack Cans (16oz)", price: "11.99", inventoryLimit: 6 },
  { title: "6 Pack Cans (12oz)", price: "11.99", inventoryLimit: 4 },
  { title: "6 Pack Bottles (12oz)", price: "11.99", inventoryLimit: 4 },
  { title: "Crowler (32oz)", price: "11.99", inventoryLimit: 3 },
  { title: "Bomber (22oz)", price: "7.99", inventoryLimit: 12 },
  { title: "750ml", price: "9.99", inventoryLimit: 6 },
  { title: "Growler Refill", price: "14.99" },
  { title: "Case (24) Cans", price: "47.99", inventoryLimit: 1 },
  { title: "Case (24) Bottles", price: "47.99", inventoryLimit: 1 },
  { title: "Case (12) Bombers", price: "79.99", inventoryLimit: 1 }
];

export function saveUntappdProduct(untappdProduct, productData = {}, allowExisting = false) {
  const shopId = Reaction.getShopId();

  const existingProduct =
    Products.findOne({ UntappdId: untappdProduct.bid }, { fields: { _id: 1 } });

  if (existingProduct) {
    if (allowExisting) {
      return existingProduct._id;
    }

    const msg = `Product ${untappdProduct.beer_name} already exists`;
    Logger.debug(msg);
    throw new Meteor.Error(409, msg);
  }

  Logger.debug(`Importing ${untappdProduct.beer_name}`);

  const reactionProductId = saveSimpleProduct(untappdProduct, productData);

  if (!saveUntappdProductImage(untappdProduct, shopId, reactionProductId)) {
    Logger.info(`Missing image for ${untappdProduct.beer_name}: hd: ${untappdProduct.beer_label_hd}/sd: ${untappdProduct.beer_label}`);
  }

  return reactionProductId;
}

export function saveProduct(reactionProductId, untappdProduct, variantData = null, options = defaultOptions) {
  const ids = [];
  const shopId = Reaction.getShopId();

  ids.push(reactionProductId);

  // create the default variant
  const reactionVariant = createReactionVariantFromUntappdVariant({
    price: 0,
    title: `${moment().format("MMMM, YYYY")} Vintage`,
    index: 0,
    ancestors: [reactionProductId],
    ...variantData,
    shopId
  });

  // insert the Reaction variant
  const reactionVariantId = Products.insert(reactionVariant, { publish: true });
  ids.push(reactionVariantId);

  const price = { min: null, max: null, range: "0.00" };
  options.forEach((option, index) => {
    const reactionOption = createReactionVariantFromUntappdVariant({
      ...option,
      index,
      ancestors: [reactionProductId, reactionVariantId],
      shopId
    });

    const reactionOptionId =
      Products.insert(reactionOption, { type: "variant" });
    ids.push(reactionOptionId);

    // I would *much* rather add a reference to the Product's image, but "make
    // it work, then make it better!"
    const variantLabelUrl = untappdProduct.beer_label_hd || untappdProduct.beer_label;
    if (variantLabelUrl) {
      saveImage(variantLabelUrl, {
        ownerId: Meteor.userId(),
        productId: reactionProductId,
        variantId: reactionOptionId,
        shopId,
        priority: 1,
        toGrid: 0
      });
    } else {
      Logger.info(`Missing image for ${untappdProduct.beer_name}: hd: ${untappdProduct.beer_label_hd}/sd: ${untappdProduct.beer_label}`);
    }

    Logger.debug(`Imported ${untappdProduct.beer_name} default/${option.title}`);

    // Update Max Price
    if (price.max === null || price.max < reactionOption.price) {
      price.max = reactionOption.price;
    }

    // Update Min Price
    if (price.min === null || price.min > reactionOption.price) {
      price.min = reactionOption.price;
    }
  }); // End defaultUntappdOptions forEach loop

  // Set final product price
  if (price.min !== price.max) {
    price.range = `${price.min} - ${price.max}`;
  } else {
    price.range = `${price.max}`;
  }
  Products.update(
    { _id: reactionProductId },
    { $set: { price } },
    { selector: { type: "simple" }, publish: true }
  );
  Logger.debug(`Product ${untappdProduct.beer_name} added`);

  return ids;
}

export async function saveProductFromUntappd(productId, productData, variantData, options, upsert = false) {
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
  const opts = { BID: productId };

  const result = await new Promise((resolve, reject) => {
    try {
      untappd.beerInfo(Meteor.bindEnvironment((error, data) => {
        if (error) {
          reject(error);
        } else {
          let reactionProductId;
          try {
            reactionProductId = saveUntappdProduct(
              data.response.beer,
              productData,
              upsert
            );
          } catch (e) {
            reject(e);
          }

          const productIds = saveProduct(
            reactionProductId,
            data.response.beer,
            variantData,
            options
          );

          resolve(productIds);
        }
      }), opts);
    } catch (error) {
      Logger.error(`There was a problem querying Untappd for id '${productId}'`, error);
      reject(error);
    }
  });

  importProductImages();
  return result;
}

export const methods = {
  /**
   * Imports products for the active Reaction Shop from Untappd with the API credentials setup for that shop.
   *
   * @async
   * @method connectors/untappd/import/products
   * @param {string} productId the UntappdId for a Product
   * @returns {array} An array of the Reaction product _ids (including variants and options) that were created.
   */
  async "connectors/untappd/import/products"(productId) {
    check(productId, Match.Maybe(Number));

    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    try {
      return saveProductFromUntappd(productId);
    } catch (error) {
      Logger.error("There was a problem importing your products from Untappd", error);
      throw new Meteor.Error("There was a problem importing your products from Untappd", error);
    }
  },

  /**
   * Imports products for the active Reaction Shop from Untappd with the API credentials setup for that shop.
   *
   * @async
   * @method connectors/untappd/import/products
   * @param {object} options An object of options for the untappd API call. Available options here: https://help.untappd.com/api/reference/product#index
   * @returns {array} An array of the Reaction product _ids (including variants and options) that were created.
   */
  async "connectors/untappd/search/products"(options) {
    check(options, Match.Maybe(Object));
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

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
    const opts = { ...options };

    const result = await new Promise((resolve, reject) => {
      try {
        untappd.beerSearch((error, data) => {
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
