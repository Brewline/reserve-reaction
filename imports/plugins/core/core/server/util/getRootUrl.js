/**
 * @name getRootUrl
 * @summary Returns the root URL, returning process.env.ROOT_URL if set,
 *  otherwise using the request's protocol & hostname
 * @param {Object} request Express request object
 * @param {Object} request.headers the Set of HTTP headers
 * @param {String} request.headers.origin Origin of the request (aka, client URL)
 * @param {String} request.hostname Hostname derived from Host or X-Forwarded-Host header
 * @param {String} request.protocol Either http or https
 * @returns {String} URL
 */
export default function getRootURL(request) {
  let rootUrl = getOriginUrl(request);

  if (!rootUrl) {
    rootUrl = getDefaultUrl();
  }

  if (!rootUrl) {
    rootUrl = getHostUrl(request);
  }

  return rootUrl;
}

function getOriginUrl(request) {
  const {
    headers: {
      origin,
      "x-reaction-origin": useOrigin = origin
    } = {}
  } = request;

  if (!useOrigin) { return; }

  if (useOrigin.endsWith("/")) {
    return useOrigin;
  }

  return `${useOrigin}/`;
}

function getHostUrl(request) {
  const { hostname, protocol } = request;

  return `${protocol}://${hostname}/`;
}

function getDefaultUrl() {
  const { ROOT_URL } = process.env;

  if (!ROOT_URL) { return; }

  if (ROOT_URL.endsWith("/")) {
    return ROOT_URL;
  }

  return `${ROOT_URL}/`;
}
