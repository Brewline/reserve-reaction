import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationItem as NavigationItemSchema } from "/imports/collections/schemas";

/**
 * @method createNavigationItem
 * @summary Creates a nav item
 * @param {Object} context An object containing the per-request state
 * @param {Object} navigationItem Nav item to add. See schema.graphql
 * @return {Promise<Object>} The created navigation item
 */
export default async function createNavigationItem(context, navigationItem) {
  const { collections, shopId, userHasPermission } = context;
  const { NavigationItems } = collections;

  const { metadata, draftData = {} } = navigationItem;

  if (userHasPermission(["core"]) === false) {
    throw new ReactionError("access-denied", "You do not have permission to create a navigation item");
  }

  let parsedMetadata = {};
  if (metadata) {
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch (error) {
      throw new ReactionError("invalid-metadata-string", "Supplied metadata JSON string could not be parsed");
    }
  }

  const newNavigationItem = {
    ...navigationItem,
    _id: Random.id(),
    shopId,
    draftData,
    data: {},
    metadata: parsedMetadata,
    createdAt: new Date(),
    hasUnpublishedChanges: true
  };

  NavigationItemSchema.validate(newNavigationItem);
  await NavigationItems.insertOne(newNavigationItem);

  return newNavigationItem;
}
