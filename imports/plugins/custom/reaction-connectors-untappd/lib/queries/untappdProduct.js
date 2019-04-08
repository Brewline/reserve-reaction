import Logger from "@reactioncommerce/logger";
import getUntappdClient from "./getUntappdClient";

/**
 * @name Query.untappdProduct
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product from Untappd
 * @param {Int} untappdId - Untappd Beer Id
 * @return {Promise<Object>} A Beer object
 */
export default async function untappdProduct(untappdId) {
  const uptappdClient = getUntappdClient();

  return new Promise((resolve, reject) => {
    try {
      const query = { BID: untappdId };

      uptappdClient.beerInfo((error, data) => {
        if (error) {
          reject(error);
        } else if (!data || !data.meta || data.meta.code !== 200) {
          reject(data.response);
        } else {
          resolve(data.response);
        }
      }, query);
    } catch (error) {
      Logger.error("There was a problem fetching beer from Untappd", error);
      reject(error);
    }
  });
}
