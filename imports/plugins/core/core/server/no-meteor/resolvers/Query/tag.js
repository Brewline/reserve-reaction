import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * Arguments passed by the client for a tags query
 * @typedef {ConnectionArgs} TagConnectionArgs - An object of all arguments that were sent by the client
 * @memberof Tag/GraphQL
 * @property {ConnectionArgs} args - An object of all arguments that were sent by the client. {@link ConnectionArgs|See default connection arguments}
 * @property {String} args.slugOrId - ID or slug of tag to query
 * @property {Boolean} args.shouldIncludeInvisible - Whether or not to include `isVisible=true` tags. Default is `false`
 */

/**
 * @name "Query.tag"
 * @method
 * @memberof Tag/GraphQL
 * @summary Returns a tag for a shop, based on tag slug or ID
 * @param {Object} _ - unused
 * @param {Object} connectionArgs - arguments sent by the client {@link ConnectionArgs|See default connection arguments}
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object[]>} Promise that resolves with array of Tag objects
 */
export default async function tag(_, connectionArgs, context) {
  const { slugOrId } = connectionArgs;

  let dbTagId;

  try {
    dbTagId = decodeTagOpaqueId(slugOrId);
  } catch (e) {
    dbTagId = slugOrId;
  }

  return context.queries.tag(context, dbTagId, connectionArgs);
}
