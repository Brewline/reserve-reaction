import UntappdClient from "node-untappd";
import Logger from "@reactioncommerce/logger";

/**
 * @name Query.untappdProduct
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product from Untappd
 * @param {Int} untappdId - Untappd Beer Id
 * @return {Promise<Object>} A Sale object
 */
export default async function untappdProduct(untappdId) {
  // TODO: this feels like a meteor dependency
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

  return new Promise((resolve, reject) => {
    try {
      untappd.beerInfo((error, data) => {
        if (error) {
          reject(error);
        } else if (!data || !data.meta || data.meta.code !== 200) {
          reject(data.response);
        } else {
          resolve(data.response);
        }
      }, { BID: untappdId });
    } catch (error) {
      Logger.error("There was a problem fetching beer from Untappd", error);
      reject(error);
    }
  });
}
