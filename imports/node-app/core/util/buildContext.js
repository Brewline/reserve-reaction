import { getHasPermissionFunctionForUser } from "/imports/plugins/core/accounts/server/no-meteor/hasPermission";
import { getShopsUserHasPermissionForFunctionForUser } from "/imports/plugins/core/accounts/server/no-meteor/shopsUserHasPermissionFor";
import getShopIdForContext from "/imports/plugins/core/accounts/server/no-meteor/getShopIdForContext";
import getRootUrl from "/imports/plugins/core/core/server/util/getRootUrl";
import getAbsoluteUrl from "/imports/plugins/core/core/server/util/getAbsoluteUrl";

/**
 * @name buildContext
 * @method
 * @memberof GraphQL
 * @summary Mutates the provided context object, adding `user`, `userId`, `shopId`, and
 *   `userHasPermission` properties.
 * @param {Object} context - A context object on which to set additional context properties
 * @param {Object} request - Request object
 * @param {Object} request.headers - Map of headers from the client request
 * @param {String} request.hostname - Hostname derived from Host or X-Forwarded-Host header
 * @param {String} request.protocol - Either http or https
 * @param {Object} [request.user] - The user who authenticated this request, if applicable
 * @returns {undefined} No return
 */
export default async function buildContext(context, request = {}) {
  // To support mocking the user in integration tests, we respect `context.user` if already set
  if (!context.user) {
    context.user = request.user || null;
  }

  const userId = (context.user && context.user._id) || null;
  context.userId = userId;

  if (userId) {
    const account = await context.collections.Accounts.findOne({ userId });
    context.account = account;
    context.accountId = (account && account._id) || null;
  }

  context.rootUrl = getRootUrl(request);
  context.getAbsoluteUrl = (path) => getAbsoluteUrl(context.rootUrl, path);

  // Add the shopId for this request, either from the authenticated user's
  // preferences or based on the rootUrl domain name.
  // *** important ***
  //   context.rootUrl must be set
  context.shopId = await getShopIdForContext(context);
  // TODO: fallback to primaryShopId if shopId is null

  // Add a curried hasPermission tied to the current user (or to no user)
  context.userHasPermission = getHasPermissionFunctionForUser(context.user);

  // Add array of all shopsIds user has permissions for
  context.shopsUserHasPermissionFor = getShopsUserHasPermissionForFunctionForUser(context.user);

  context.requestHeaders = request.headers;
  // #brewlinecustom
  applyBrewlineCustom(context, request);
}

function applyBrewlineCustom(context, request) {
  // give access to the entire request object
  context.request = request;

  // expose the alternate id
  // used for tying anonymous actions to authenticated actions
  // protip: the client can use whatever it wants as the alternateId. It should
  // probably be device specific, and should not be used for anything sensitive
  const { "x-brewline-alternate-id": alternateId } = request.headers || {};
  context.alternateId = alternateId;
}
