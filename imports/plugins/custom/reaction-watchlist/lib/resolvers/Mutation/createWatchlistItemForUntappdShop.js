import scrubUntappdBrewery from "@brewline/untappd/lib/scrubUntappdBrewery";
import { notifyCreationOfWatchlistItem, processWatchlistItemNotifications } from "../../utils/notify";

/**
 * @name Query.createWatchlistItemForUntappdShop
 * @method
 * @memberof Watchlist/GraphQL
 * @summary Create a Watchlist Item
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {String} args.watchlist - unique id for the watchlist to which this item belongs
 * @param {String} args.untappdId - unique id for this item
 * @param {String} args.clientMutationId - An optional string identifying the
 * mutation call
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.shopId - sale belonging to this shop
 * @return {Promise<Object>} A Watchlist object
 */
export default async function createWatchlistItemForUntappdShop(_, args, context) {
  const { watchlist, untappdId, clientMutationId } = args;
  const {
    alternateId,
    mutations,
    queries,
    request: { ip } = {},
    requestHeaders,
    shopId,
    userId
  } = context;

  const metadata = {
    ip: requestHeaders["x-forwarded-for"] || ip
  };

  // TODO: consider some throttling (to protect our API key usage)
  const untappdResponse = await queries.untappdShop(untappdId);
  const { brewery = {} } = untappdResponse || {};
  const itemMetadata = scrubUntappdBrewery(brewery);

  const {
    brewery_name: displayName,
    brewery_label: breweryLabel,
    brewery_label_hd: breweryLabelHd
  } = itemMetadata || {};

  const label = breweryLabelHd || breweryLabel;

  const item = await mutations.createWatchlistItem(
    context,
    shopId,
    userId || alternateId,
    watchlist,
    untappdId,
    { displayName, label, itemMetadata, metadata }
  );

  notifyCreationOfWatchlistItem(
    "New Shop Watchlist Item",
    "createWatchlistItemForUntappdProduct",
    item,
    { color: "#36C5F0" }
  );
  processWatchlistItemNotifications();

  return { item, clientMutationId };
}
