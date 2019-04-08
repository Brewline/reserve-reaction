import Logger from "@reactioncommerce/logger";
import getUntappdClient from "./getUntappdClient";

/**
 * @name Query.untappdShop
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product from Untappd
 * @param {Int} untappdShopId - Untappd Brewery Id
 * @return {Promise<Object>} A Brewery object
 */
export default async function untappdShop(untappdShopId) {
  const uptappdClient = getUntappdClient();

  return new Promise((resolve, reject) => {
    try {
      const query = { BREWERY_ID: untappdShopId };

      uptappdClient.breweryInfo((error, data) => {
        if (error) {
          reject(error);
        } else if (!data || !data.meta || data.meta.code !== 200) {
          reject(data.response);
        } else {
          resolve(data.response);
        }
      }, query);
    } catch (error) {
      Logger.error("There was a problem fetching brewery from Untappd", error);
      reject(error);
    }
  });
}
