import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name Mutation.removeTag
 * @method
 * @memberof Routes/GraphQL
 * @summary Remove a specified tag
 * @param {Object} parentResult - unused
 * @param {Object} args.input - RemoveTagInput
 * @param {String} args.input.id - id of the tag to remove
 * @param {String} args.input.shopId - shopId of the tag to remove
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} RemoveTagPayload
 */
export default async function removeTag(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    id: opaqueTagId,
    shopId: opaqueShopId
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const tagId = decodeTagOpaqueId(opaqueTagId);

  const tag = await context.mutations.removeTag(context, {
    shopId,
    tagId
  });

  return {
    clientMutationId,
    tag
  };
}
