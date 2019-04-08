import Logger from "@reactioncommerce/logger";
import getUntappdClient from "./getUntappdClient";

/**
 * @name Query.untappdShops
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product search result from Untappd
 * @param {String} q - the query object to pass to Untappd
 * @param {Int} limit - the number of results to return (aka, page size)
 * @param {Int} offset - the number of pages to skip
 * @return {Promise<Object>} A list of Brewery objects
 */
export default async function untappdShops(q, limit, offset) {
  const untappdClient = getUntappdClient();

  const result = await new Promise((resolve, reject) => {
    try {
      const query = { q, offset, limit };

      untappdClient.brewerySearch((error, data) => {
        if (error) {
          reject(error);
        } else if (!data || !data.meta || data.meta.code !== 200) {
          reject(data.response);
        } else {
          resolve(data.response);
        }
      }, query);
    } catch (error) {
      Logger.error("There was a problem searching Untappd", error);
      reject(error);
    }
  });

  return result;
}
