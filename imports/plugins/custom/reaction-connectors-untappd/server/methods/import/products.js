/* eslint camelcase: 0 */
import _ from "lodash";
import Untappd from "node-untappd";
import { Job } from "meteor/vsivsi:job-collection";
import { Meteor } from "meteor/meteor";
import { Logger } from "/server/api";
import { check, Match } from "meteor/check";
import { Reaction } from "/server/api";
import { Products, Jobs, Tags } from "/lib/collections";
import { getApiInfo } from "../api/api";
import { connectorsRoles } from "../../lib/roles";
import { importImages } from "../../jobs/image-import";

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
 * @param  {object} options Options object
 * @param  {object} options.untappdProduct the Untappd product object
 * @param  {string} options.shopId The shopId we're importing for
 * @param  {array} options.hashtags An array of hashtag strings that should be attached to this product.
 * @return {object} An object that fits the `Product` schema
 *
 * @todo consider abstracting private Untappd import helpers into a helpers file
 */
function createReactionProductFromUntappdProduct(options) {
  const { untappdProduct, shopId, hashtags } = options;
  const reactionProduct = {
    ancestors: [],
    createdAt: new Date(),
    description: untappdProduct.body_html.replace(/(<([^>]+)>)/ig, ""), // Strip HTML
    handle: untappdProduct.handle,
    hashtags: hashtags,
    isDeleted: false,
    isVisible: false,
    metafields: [],
    pageTitle: untappdProduct.pageTitle,
    productType: untappdProduct.product_type,
    requiresShipping: true,
    shopId: shopId, // set shopId to active shopId;
    untappdId: untappdProduct.id.toString(), // save it here to make sync lookups cheaper
    template: "productDetailSimple",
    title: untappdProduct.title,
    type: "simple",
    updatedAt: new Date(),
    vendor: untappdProduct.vendor,
    workflow: {
      status: "new",
      workflow: ["imported"]
    },
    skipRevision: true
  };

  // Add untappd options to meta fields as is.
  if (Array.isArray(untappdProduct.options)) {
    untappdProduct.options.forEach((option) => {
      reactionProduct.metafields.push({
        scope: "untappd",
        key: option.name,
        value: option.values.join(", "),
        namespace: "options"
      });
    });
  }

  return reactionProduct;
}

/**
 * Finds the images associated with a particular untappd variant
 * @method findProductImages
 * @private
 * @param  {number} untappdProductId The product `id` from untappd
 * @param  {array} images An array of image objects from a Untappd product
 * @return {array} Returns an array of image objects that match the passed untappdProductId
 */
function findProductImages(untappdProductId, images) {
  return images.filter((imageObj) => imageObj.product_id === untappdProductId);
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
  new Job(Jobs, "connectors/untappd/import/image", { url: url, metadata: metadata })
    .priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    }).save();
}

export const methods = {
  /**
   * Imports products for the active Reaction Shop from Untappd with the API credentials setup for that shop.
   *
   * @async
   * @method connectors/untappd/import/products
   * @param {object} options An object of options for the untappd API call. Available options here: https://help.untappd.com/api/reference/product#index
   * @returns {array} An array of the Reaction product _ids (including variants and options) that were created.
   */
  async "connectors/untappd/import/products"(options) {
    check(options, Match.Maybe(Object));
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const apiCreds = getApiInfo();
    const untappd = new Untappd(apiCreds);
    const shopId = Reaction.getShopId();
    const limit = 50; // Untappd returns a maximum of 250 results per request
    const tagCache = createTagCache();
    const ids = [];
    const opts = Object.assign({}, {
      published_status: "published",
      limit: limit
    }, { ... options });

    try {
      const productCount = await untappd.product.count();
      const numPages = Math.ceil(productCount / limit);
      const pages = [...Array(numPages).keys()];
      Logger.info(`Untappd Connector is preparing to import ${productCount} products`);

      for (const page of pages) {
        Logger.debug(`Importing page ${page + 1} of ${numPages} - each page has ${limit} products`);
        const untappdProducts = await untappd.product.list({ ...opts, page: page });
        for (const untappdProduct of untappdProducts) {
          if (!Products.findOne({ untappdId: untappdProduct.id }, { fields: { _id: 1 } })) {
            Logger.debug(`Importing ${untappdProduct.title}`);
            const price = { min: null, max: null, range: "0.00" };

            // Get tags from untappd and register them if they don't exist.
            // push tag Id's into our hashtags array for use in the product
            // We can't load all tags beforehand because Untappd doesn't have a tags API
            const hashtags = [];
            const untappdTags = untappdProduct.tags.split(",");
            for (const tag of untappdTags) {
              if (tag !== "") {
                const normalizedTag = {
                  name: tag,
                  slug: Reaction.getSlug(tag),
                  shopId: shopId,
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
                hashtags.push(tagCache[normalizedTag.slug]);
              }
            }

            // Get Untappd variants, options and ternary options
            const { untappdVariants, untappdOptions, untappdTernaryOptions } = getUntappdVariantsAndOptions(untappdProduct);

            // Setup reaction product
            const reactionProduct = createReactionProductFromUntappdProduct({ untappdProduct, shopId, hashtags });

            // Insert product, save id
            const reactionProductId = Products.insert(reactionProduct, { selector: { type: "simple" }, publish: true });
            ids.push(reactionProductId);

            // Save the primary image to the grid and as priority 0
            saveImage(untappdProduct.image.src, {
              ownerId: Meteor.userId(),
              productId: reactionProductId,
              variantId: reactionProductId,
              shopId: shopId,
              priority: 0,
              toGrid: 1
            });

            // Save all remaining product images to product
            const productImages = findProductImages(untappdProduct.id, untappdProduct.images);
            for (const productImage of productImages) {
              if (untappdProduct.image.id !== productImage.id) {
                saveImage(productImage.src, {
                  ownerId: Meteor.userId(),
                  productId: reactionProductId,
                  variantId: reactionProductId,
                  shopId: shopId,
                  priority: productImage.position, // Untappd index positions starting at 1.
                  toGrid: 0
                });
              }
            }

            // If variantLabel exists, we have at least one variant
            if (untappdVariants) {
              Logger.debug(`Importing ${untappdProduct.title} variants`);

              untappdVariants.forEach((variant, i) => {
                const untappdVariant = untappdProduct.variants.find((v) => v.option1 === variant);

                if (untappdVariant) {
                  // create the Reaction variant
                  const reactionVariant = createReactionVariantFromUntappdVariant({
                    untappdVariant,
                    variant,
                    index: i,
                    ancestors: [reactionProductId],
                    shopId
                  });

                  // insert the Reaction variant
                  const reactionVariantId = Products.insert(reactionVariant, { publish: true });
                  ids.push(reactionVariantId);

                  // If we have untappd options, create reaction options
                  if (untappdOptions) {
                    Logger.debug(`Importing ${untappdProduct.title} ${variant} options`);
                    untappdOptions.forEach((option, j) => {
                      // Find the option that nests under our current variant.
                      const untappdOption = untappdProduct.variants.find((o) => {
                        return o.option1 === variant && o.option2 === option;
                      });

                      if (untappdOption) {
                        const reactionOption = createReactionVariantFromUntappdVariant({
                          untappdVariant: untappdOption,
                          variant: option,
                          index: j,
                          ancestors: [reactionProductId, reactionVariantId],
                          shopId
                        });

                        const reactionOptionId = Products.insert(reactionOption, { type: "variant" });
                        ids.push(reactionOptionId);
                        Logger.debug(`Imported ${untappdProduct.title} ${variant}/${option}`);

                        // Update Max Price
                        if (price.max === null || price.max < reactionOption.price) {
                          price.max = reactionOption.price;
                        }

                        // Update Min Price
                        if (price.min === null || price.min > reactionOption.price) {
                          price.min = reactionOption.price;
                        }

                        // Save all relevant variant images to our option
                        const optionImages = findVariantImages(untappdOption.id, untappdProduct.images);
                        for (const optionImage of optionImages) {
                          saveImage(optionImage.src, {
                            ownerId: Meteor.userId(),
                            productId: reactionProductId,
                            variantId: reactionOptionId,
                            shopId: shopId,
                            priority: 1,
                            toGrid: 0
                          });
                        }

                        // THIS LOOP INSERTS PRODUCTS A LEVEL DEEPER THAN THE REACTION
                        // UI CURRENTLY SUPPORTS. IF YOUR SHOPIFY STORE USES THREE OPTION
                        // LEVELS, YOU WILL NEED TO BUILD UI SUPPORT FOR THAT.
                        if (untappdTernaryOptions) {
                          Logger.warn("Importing untappd product with 3 options. The Reaction UI does not currently support this.");
                          Logger.debug(`Importing ${untappdProduct.title} ${variant} ${option} options`);
                          untappdTernaryOptions.forEach((ternaryOption, k) => {
                            // Find the option that nests under our current variant.
                            const untappdTernaryOption = untappdProduct.variants.find((o) => {
                              return o.option1 === variant && o.option2 === option && o.option3 === ternaryOption;
                            });

                            if (untappdTernaryOption) {
                              const reactionTernaryOption = createReactionVariantFromUntappdVariant({
                                untappdVariant: untappdTernaryOption,
                                variant: ternaryOption,
                                index: k,
                                ancestors: [reactionProductId, reactionVariantId, reactionOptionId],
                                shopId
                              });

                              const reactionTernaryOptionId = Products.insert(reactionTernaryOption, { type: "variant" });
                              ids.push(reactionTernaryOptionId);
                              Logger.debug(`Imported ${untappdProduct.title} ${variant}/${option}/${ternaryOption}`);

                              // Update Max Price
                              if (price.max === null || price.max < reactionTernaryOption.price) {
                                price.max = reactionTernaryOption.price;
                              }

                              // Update Min Price
                              if (price.min === null || price.min > reactionTernaryOption.price) {
                                price.min = reactionTernaryOption.price;
                              }

                              // Save all relevant variant images to our option
                              const ternaryOptionImages = findVariantImages(untappdTernaryOption.id, untappdProduct.images);
                              for (const ternaryOptionImage of ternaryOptionImages) {
                                saveImage(ternaryOptionImage.src, {
                                  ownerId: Meteor.userId(),
                                  productId: reactionProductId,
                                  variantId: reactionOptionId,
                                  shopId: shopId,
                                  priority: 1,
                                  toGrid: 0
                                });
                              } // So many close parens and brackets. Don't get lost.
                            }
                          }); // End untappdTernaryOptions forEach loop
                        }
                      }
                    }); // End untappdOptions forEach loop
                  } else {
                    // Product does not have options, just variants
                    // Update Max Price
                    if (price.max === null || price.max < reactionVariant.price) {
                      price.max = reactionVariant.price;
                    }

                    // Update Min Price
                    if (price.min === null || price.min > reactionVariant.price) {
                      price.min = reactionVariant.price;
                    }

                    // Save all relevant variant images to our variant.
                    const variantImages = findVariantImages(untappdVariant.id, untappdProduct.images);
                    for (const variantImage of variantImages) {
                      saveImage(variantImage.src, {
                        ownerId: Meteor.userId(),
                        productId: reactionProductId,
                        variantId: reactionVariantId,
                        shopId: shopId,
                        priority: 1,
                        toGrid: 0
                      });
                    }
                    Logger.debug(`Imported ${untappdProduct.title} ${variant}`);
                  }
                }
              });
            }

            // Set final product price
            if (price.min !== price.max) {
              price.range = `${price.min} - ${price.max}`;
            } else {
              price.range = `${price.max}`;
            }
            Products.update({ _id: reactionProductId }, { $set: { price: price } }, { selector: { type: "simple" }, publish: true });
            Logger.debug(`Product ${untappdProduct.title} added`);
          } else { // product already exists check
            Logger.debug(`Product ${untappdProduct.title} already exists`);
          }
        } // End product loop
      } // End pages loop
      Logger.info(`Reaction Untappd Connector has finished importing ${ids.length} products`);

      // Run jobs to import all queued images;
      importImages();
      return ids;
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

    const untappd = new UntappdClient(debug);
    const shopId = Reaction.getShopId();
    const limit = 50; // Untappd returns a maximum of 250 results per request
    const tagCache = createTagCache();
    const ids = [];
    const opts = Object.assign({}, {
      published_status: "published",
      limit: limit
    }, { ... options });

    try {
      const result = await untappd.beerSearch(opts, _.noop);
      const productCount = await untappd.product.count();
      const numPages = Math.ceil(productCount / limit);
      const pages = [...Array(numPages).keys()];
      Logger.info(`Untappd Connector is preparing to import ${productCount} products`);

      for (const page of pages) {
        Logger.debug(`Importing page ${page + 1} of ${numPages} - each page has ${limit} products`);
        const untappdProducts = await untappd.product.list({ ...opts, page: page });
        for (const untappdProduct of untappdProducts) {
          if (!Products.findOne({ untappdId: untappdProduct.id }, { fields: { _id: 1 } })) {
            Logger.debug(`Importing ${untappdProduct.title}`);
            const price = { min: null, max: null, range: "0.00" };

            // Get tags from untappd and register them if they don't exist.
            // push tag Id's into our hashtags array for use in the product
            // We can't load all tags beforehand because Untappd doesn't have a tags API
            const hashtags = [];
            const untappdTags = untappdProduct.tags.split(",");
            for (const tag of untappdTags) {
              if (tag !== "") {
                const normalizedTag = {
                  name: tag,
                  slug: Reaction.getSlug(tag),
                  shopId: shopId,
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
                hashtags.push(tagCache[normalizedTag.slug]);
              }
            }

            // Get Untappd variants, options and ternary options
            const { untappdVariants, untappdOptions, untappdTernaryOptions } = getUntappdVariantsAndOptions(untappdProduct);

            // Setup reaction product
            const reactionProduct = createReactionProductFromUntappdProduct({ untappdProduct, shopId, hashtags });

            // Insert product, save id
            const reactionProductId = Products.insert(reactionProduct, { selector: { type: "simple" }, publish: true });
            ids.push(reactionProductId);

            // Save the primary image to the grid and as priority 0
            saveImage(untappdProduct.image.src, {
              ownerId: Meteor.userId(),
              productId: reactionProductId,
              variantId: reactionProductId,
              shopId: shopId,
              priority: 0,
              toGrid: 1
            });

            // Save all remaining product images to product
            const productImages = findProductImages(untappdProduct.id, untappdProduct.images);
            for (const productImage of productImages) {
              if (untappdProduct.image.id !== productImage.id) {
                saveImage(productImage.src, {
                  ownerId: Meteor.userId(),
                  productId: reactionProductId,
                  variantId: reactionProductId,
                  shopId: shopId,
                  priority: productImage.position, // Untappd index positions starting at 1.
                  toGrid: 0
                });
              }
            }

            // If variantLabel exists, we have at least one variant
            if (untappdVariants) {
              Logger.debug(`Importing ${untappdProduct.title} variants`);

              untappdVariants.forEach((variant, i) => {
                const untappdVariant = untappdProduct.variants.find((v) => v.option1 === variant);

                if (untappdVariant) {
                  // create the Reaction variant
                  const reactionVariant = createReactionVariantFromUntappdVariant({
                    untappdVariant,
                    variant,
                    index: i,
                    ancestors: [reactionProductId],
                    shopId
                  });

                  // insert the Reaction variant
                  const reactionVariantId = Products.insert(reactionVariant, { publish: true });
                  ids.push(reactionVariantId);

                  // If we have untappd options, create reaction options
                  if (untappdOptions) {
                    Logger.debug(`Importing ${untappdProduct.title} ${variant} options`);
                    untappdOptions.forEach((option, j) => {
                      // Find the option that nests under our current variant.
                      const untappdOption = untappdProduct.variants.find((o) => {
                        return o.option1 === variant && o.option2 === option;
                      });

                      if (untappdOption) {
                        const reactionOption = createReactionVariantFromUntappdVariant({
                          untappdVariant: untappdOption,
                          variant: option,
                          index: j,
                          ancestors: [reactionProductId, reactionVariantId],
                          shopId
                        });

                        const reactionOptionId = Products.insert(reactionOption, { type: "variant" });
                        ids.push(reactionOptionId);
                        Logger.debug(`Imported ${untappdProduct.title} ${variant}/${option}`);

                        // Update Max Price
                        if (price.max === null || price.max < reactionOption.price) {
                          price.max = reactionOption.price;
                        }

                        // Update Min Price
                        if (price.min === null || price.min > reactionOption.price) {
                          price.min = reactionOption.price;
                        }

                        // Save all relevant variant images to our option
                        const optionImages = findVariantImages(untappdOption.id, untappdProduct.images);
                        for (const optionImage of optionImages) {
                          saveImage(optionImage.src, {
                            ownerId: Meteor.userId(),
                            productId: reactionProductId,
                            variantId: reactionOptionId,
                            shopId: shopId,
                            priority: 1,
                            toGrid: 0
                          });
                        }

                        // THIS LOOP INSERTS PRODUCTS A LEVEL DEEPER THAN THE REACTION
                        // UI CURRENTLY SUPPORTS. IF YOUR SHOPIFY STORE USES THREE OPTION
                        // LEVELS, YOU WILL NEED TO BUILD UI SUPPORT FOR THAT.
                        if (untappdTernaryOptions) {
                          Logger.warn("Importing untappd product with 3 options. The Reaction UI does not currently support this.");
                          Logger.debug(`Importing ${untappdProduct.title} ${variant} ${option} options`);
                          untappdTernaryOptions.forEach((ternaryOption, k) => {
                            // Find the option that nests under our current variant.
                            const untappdTernaryOption = untappdProduct.variants.find((o) => {
                              return o.option1 === variant && o.option2 === option && o.option3 === ternaryOption;
                            });

                            if (untappdTernaryOption) {
                              const reactionTernaryOption = createReactionVariantFromUntappdVariant({
                                untappdVariant: untappdTernaryOption,
                                variant: ternaryOption,
                                index: k,
                                ancestors: [reactionProductId, reactionVariantId, reactionOptionId],
                                shopId
                              });

                              const reactionTernaryOptionId = Products.insert(reactionTernaryOption, { type: "variant" });
                              ids.push(reactionTernaryOptionId);
                              Logger.debug(`Imported ${untappdProduct.title} ${variant}/${option}/${ternaryOption}`);

                              // Update Max Price
                              if (price.max === null || price.max < reactionTernaryOption.price) {
                                price.max = reactionTernaryOption.price;
                              }

                              // Update Min Price
                              if (price.min === null || price.min > reactionTernaryOption.price) {
                                price.min = reactionTernaryOption.price;
                              }

                              // Save all relevant variant images to our option
                              const ternaryOptionImages = findVariantImages(untappdTernaryOption.id, untappdProduct.images);
                              for (const ternaryOptionImage of ternaryOptionImages) {
                                saveImage(ternaryOptionImage.src, {
                                  ownerId: Meteor.userId(),
                                  productId: reactionProductId,
                                  variantId: reactionOptionId,
                                  shopId: shopId,
                                  priority: 1,
                                  toGrid: 0
                                });
                              } // So many close parens and brackets. Don't get lost.
                            }
                          }); // End untappdTernaryOptions forEach loop
                        }
                      }
                    }); // End untappdOptions forEach loop
                  } else {
                    // Product does not have options, just variants
                    // Update Max Price
                    if (price.max === null || price.max < reactionVariant.price) {
                      price.max = reactionVariant.price;
                    }

                    // Update Min Price
                    if (price.min === null || price.min > reactionVariant.price) {
                      price.min = reactionVariant.price;
                    }

                    // Save all relevant variant images to our variant.
                    const variantImages = findVariantImages(untappdVariant.id, untappdProduct.images);
                    for (const variantImage of variantImages) {
                      saveImage(variantImage.src, {
                        ownerId: Meteor.userId(),
                        productId: reactionProductId,
                        variantId: reactionVariantId,
                        shopId: shopId,
                        priority: 1,
                        toGrid: 0
                      });
                    }
                    Logger.debug(`Imported ${untappdProduct.title} ${variant}`);
                  }
                }
              });
            }

            // Set final product price
            if (price.min !== price.max) {
              price.range = `${price.min} - ${price.max}`;
            } else {
              price.range = `${price.max}`;
            }
            Products.update({ _id: reactionProductId }, { $set: { price: price } }, { selector: { type: "simple" }, publish: true });
            Logger.debug(`Product ${untappdProduct.title} added`);
          } else { // product already exists check
            Logger.debug(`Product ${untappdProduct.title} already exists`);
          }
        } // End product loop
      } // End pages loop
      Logger.info(`Reaction Untappd Connector has finished importing ${ids.length} products`);

      // Run jobs to import all queued images;
      importImages();
      return ids;
    } catch (error) {
      Logger.error("There was a problem importing your products from Untappd", error);
      throw new Meteor.Error("There was a problem importing your products from Untappd", error);
    }
  }
};

Meteor.methods(methods);
