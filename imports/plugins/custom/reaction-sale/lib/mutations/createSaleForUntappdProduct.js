// TODO: this belongs in the onboarding package

import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import {
  saveProductVariants,
  saveUntappdProduct
  // } from "@brewline/untappd/server/methods/import/products";
} from "/imports/plugins/custom/reaction-connectors-untappd/server/methods/import/products";
import {
  processImportProductImagesJobs,
  processImportShopImagesJobs
} from "/imports/plugins/custom/reaction-connectors-untappd/server/jobs/image-import";
// import { importUntappdShop } from "@brewline/untappd/server/methods/import/shop";
import { importUntappdShop } from "/imports/plugins/custom/reaction-connectors-untappd/server/methods/import/shops";
import { saveUntappdShopFunctionGenerator } from "/imports/plugins/custom/reaction-brewline-onboarding/server/methods";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import publishProductToCatalog from "/imports/plugins/core/catalog/server/no-meteor/utils/publishProductToCatalog";
import { Sales } from "../collections";
import { Sale as SaleSchema } from "../collections/schemas";
import getOnboardingUserId from "../utils/getOnboardingUserId";

function hackApplicationMethods({ userId }) {
  // OH, WE HACKING NOW!
  // capture some function pointers, used to restore behavior later
  const { getUserId } = Reaction;
  const { user: meteorUser, userId: meteorUserId } = Meteor;

  // override some behavior
  Reaction.getUserId = () => userId;
  Meteor.user = () => ({ _id: userId });
  Meteor.userId = () => userId;

  return { getUserId, meteorUserId, meteorUser };
}

function restoreHackedApplicationMethods({ getUserId, meteorUserId, meteorUser }) {
  // restore original behavior
  Reaction.getUserId = getUserId;
  Meteor.user = meteorUser;
  Meteor.userId = meteorUserId;
  // END THE INSANITY
}

/**
 * @method createSaleForUntappdProduct
 * @summary Given an UntappdProductId create a Product, and if necessary, a
 * Sale, and if necessary, a Shop, then add it to the Catalog.
 * @param {Object} context -  an object containing the per-request state
 * @param {Id} shopId - the Shop for which the Sale will belong
 * If shopId === primaryShopId, a Shop will be created using the data
 * corresponding to the Beer's Brewer
 * @param {Object} untappdId - the Product's Untappd Id
 * @param {Object} saleData - Sale Form Data (see: Sale Schema)
 * @param {String} [saleData.saleId] - To simply add a Product to an existing
 * Sale, provide the saleId. Doing do ignores the rest of the sale formData
 * @param {Array} variantOptionsData - Options to include in the Sale
 * @return {Promise<Object>} A Sale object.
 */
export default async function createSaleForUntappdProduct(context, shopId, untappdId, saleData, variantOptionsData) {
  let sale;
  let targetShopId;

  const { collections } = context;
  const { Accounts, Products, Shops } = collections;

  const onboardingUserId = await getOnboardingUserId(collections);
  const hackedApplicationMethods = hackApplicationMethods({ userId: onboardingUserId });

  try {
    const cleanedSaleData = SaleSchema.clean(saleData); // add default values and such
    // SaleSchema.validate(saleData);
    const { saleId, ...saleFormData } = cleanedSaleData;

    // fetch Product from Untappd
    const untappdProduct = await context.queries.untappdProduct(untappdId);
    if (!untappdProduct) {
      throw new ReactionError("not-found", "Untappd Product not found (there may be an issue with the Untappd data feed)");
    }

    const { beer: untappdBeer } = untappdProduct;

    const primaryShopId = await context.queries.primaryShopId(collections);
    if (shopId !== primaryShopId) {
      targetShopId = shopId;
    } else {
      // upsert a shop based on the product info
      const { brewery: { brewery_id: untappdBreweryId } = {} } = untappdBeer;

      if (untappdBreweryId) {
        let shop = await Shops.findOne({ UntappdId: untappdBreweryId });

        // TODO: flag as `public: false`
        if (!shop) {
          const fnSaveUntappdShop =
            saveUntappdShopFunctionGenerator(onboardingUserId);

          shop = await importUntappdShop(untappdBreweryId, fnSaveUntappdShop);

          await processImportShopImagesJobs();

          // restore the onboarding account's shopId
          Accounts.update({ _id: onboardingUserId }, {
            $set: {
              shopId: primaryShopId
            }
          });
        }

        ({ _id: targetShopId } = shop || {});
      } else {
        Logger.error(`This product (UntappdId: ${untappdId}) does not have a Brewery??`);
      }
    }

    // upsert Untappd Brewery
    if (!targetShopId) {
      throw new ReactionError("not-found", "Untappd Shop not found (there may be an issue with the Untappd data feed)");
    }

    if (saleId) {
      sale = Sales.findOne({ _id: saleId });
    }
    if (!sale) {
      if (saleId) {
        Logger.error(`Sale Id provided (${saleId}), but not Sale found.`);
        throw new ReactionError("not-found", "Sale not found");
      }

      // TODO: figure out how to dedupe sales

      saleFormData.isDemo = targetShopId !== shopId;
      saleFormData.shopId = targetShopId;

      if (!saleFormData.headline) {
        const { beer_name: beerName } = untappdBeer;
        saleFormData.headline = `${beerName} Can Release`;
      }
      if (!saleFormData.slug) {
        saleFormData.slug = Reaction.getSlug(saleFormData.headline);
      }
      const insertedSaleId = Sales.insert(saleFormData);
      sale = Sales.findOne({ _id: insertedSaleId });
    }

    // upsert Product
    // create Variant
    // create Options
    const reactionProductId = await createProductDocuments(
      targetShopId,
      sale,
      untappdBeer,
      variantOptionsData
    );

    await new Promise((resolve) => setTimeout(resolve, 10000)); // fml... wait for image hook to kick in
    await processImportProductImagesJobs();

    // publish Product (with these Sale Variants only)
    const reactionProduct = await Products.findOne({ _id: reactionProductId });

    await publishProductToCatalog(reactionProduct, context);

    return sale;
  } catch (err) {
    if (err instanceof ReactionError) {
      throw err;
    } else {
      throw new ReactionError("internal-error", "Error creating sale");
    }
  } finally {
    restoreHackedApplicationMethods(hackedApplicationMethods);
  }
}

async function createProductDocuments(shopId, sale, untappdProduct, optionsData) {
  const productData = {
    shopId,
    weight: 2 // a cryptically-named UI setting
  };

  const upsert = true;
  const reactionProductId = saveUntappdProduct(
    shopId,
    untappdProduct,
    productData,
    upsert
  );

  const variantData = {
    title: sale.headline,
    saleId: sale._id
  };

  saveProductVariants(
    shopId,
    reactionProductId,
    untappdProduct,
    variantData,
    optionsData
  );

  return reactionProductId;
}
