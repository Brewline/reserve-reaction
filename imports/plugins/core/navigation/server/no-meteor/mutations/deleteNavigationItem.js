import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @method deleteNavigationItem
 * @summary Deletes a navigation item
 * @param {Object} context An object containing the per-request state
 * @param {String} _id _id of navigation item to delete
 * @return {Promise<Object>} Deleted navigation item
 */
export default async function deleteNavigationItem(context, _id) {
  const { collections, userHasPermission } = context;
  const { NavigationItems } = collections;

  if (userHasPermission(["core"]) === false) {
    throw new ReactionError("access-denied", "You do not have permission to delete a navigation item");
  }

  const navigationItem = await NavigationItems.findOne({ _id });
  if (!navigationItem) {
    throw new ReactionError("navigation-item-not-found", "Navigation item was not found");
  }

  await NavigationItems.deleteOne({ _id });

  return navigationItem;
}
