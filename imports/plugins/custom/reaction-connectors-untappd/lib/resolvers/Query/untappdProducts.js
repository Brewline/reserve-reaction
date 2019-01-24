import UntappdClient from "node-untappd";
import Logger from "@reactioncommerce/logger";

/**
 * @name Query.untappdProducts
 * @method
 * @memberof Catalog/GraphQL
 * @summary Get a product search result from Untappd
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} args.q: String - the query string to pass to Untappd
 * @param {Object} args.limit: Int - the number of results to return (aka, page size)
 * @param {Object} args.offset: Int - the number of pages to skip
 * @param {Object} _context - unused
 * @return {Promise<Object>} A Sale object
 */
export default async function untappdProducts(_, args, _context) {
  const { q, offset, limit } = args;

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

  const result = await new Promise((resolve, reject) => {
    try {
      untappd.beerSearch((error, data) => {
        if (error) {
          reject(error);
        } else if (!data || !data.meta || data.meta.code !== 200) {
          reject(data.response);
        } else {
          resolve(data.response);
        }
      }, { q, offset, limit });
    } catch (error) {
      Logger.error("There was a problem searching Untappd", error);
      reject(error);
    }
  });

  return result;
}
