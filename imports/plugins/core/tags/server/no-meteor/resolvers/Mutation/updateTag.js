import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name Mutation.updateTag
 * @method
 * @memberof Routes/GraphQL
 * @summary Update a specified redirect rule
 * @param {Object} parentResult - unused
 * @param {Object} args.input - UpdateTagInput
 * @param {String} args.input.name - path to redirect from
 * @param {String} args.input.displayName - path to redirect to
 * @param {Boolean} args.input.isVisible - whether the tag is visible
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} UpdateTagPayload
 */
export default async function updateTag(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    id: opaqueTagId,
    shopId: opaqueShopId,
    ...tagInput
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const tagId = decodeTagOpaqueId(opaqueTagId);

  const tag = await context.mutations.updateTag(context, {
    shopId,
    tagId,
    ...tagInput
  });

  return {
    clientMutationId,
    tag
  };
}
