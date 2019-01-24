import { get } from "lodash";
import getShopIdByDomain from "./getShopIdByDomain";

/**
 * @summary Returns the current account's active shop ID,
 *   if any, or shop ID for the domain, or, the primaryShop ID
 * @param {Object} context Per-request app context
 * @returns {String|null} Shop ID or `null`
 */
export default async function getShopIdForContext(context) {
  const { collections, user } = context;

  let shopId;

  if (user) {
    shopId = get(user, "profile.preferences.reaction.activeShopId");
  }

  // if still not found, look up the shop by domain
  if (!shopId) {
    shopId = await getShopIdByDomain(context);
  }

  if (shopId) {
    // TODO: set user preference such that a user returning to the Primary Shop
    // will already be in their preferred shop

    // Reaction.setUserPreferences("reaction", "activeShopId", shopId);
    return shopId;
  }

  // if still not found, use the primaryShopId query
  return context.queries.primaryShopId(collections);
}
