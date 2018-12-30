import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { makeExecutableSchema } from "graphql-tools";
import buildContext from "./util/buildContext";
import getErrorFormatter from "./util/getErrorFormatter";
import tokenMiddleware from "./util/tokenMiddleware";

const defaultServerConfig = {
  // graphql endpoint
  path: "/graphql-alpha",
  // GraphiQL endpoint
  graphiqlPath: "/graphiql",
  // GraphiQL options (default: log the current user in your request)
  graphiqlOptions: {
    passHeader: "'meteor-login-token': localStorage['Meteor.loginToken'] || ''"
  }
};

const resolverValidationOptions = {
  // After we fix all errors that this prints, we should probably go
  // back to `true` (the default)
  requireResolversForResolveType: false
};

/**
 * @name createApolloServer
 * @method
 * @memberof GraphQL
 * @summary Creates an express app, adds graphql and optionally graphiql routes to it,
 *   and the returns it.
 * @returns {ExpressApp} The express app
 */
export default function createApolloServer(options = {}) {
  // the Meteor GraphQL server is an Express server
  const expressServer = express();

  const { addCallMeteorMethod, context: contextFromOptions, resolvers, typeDefs } = options;
  const graphQLPath = options.path || defaultServerConfig.path;

  // GraphQL endpoint, enhanced with JSON body parser
  expressServer.use(
    graphQLPath,
    cors(),
    bodyParser.json(),
    tokenMiddleware(contextFromOptions),
    graphqlExpress(async (req) => {
      let logFunction;
      const context = { ...contextFromOptions };

      // meteorTokenMiddleware will have set req.user if there is one

      await buildContext(context, req);

      addCallMeteorMethod(context);

      if (options.debug) {
        logFunction = (...args) => { console.log(...args); };
      }

      return {
        context,
        debug: options.debug || false,
        formatError: getErrorFormatter(context),
        formatResponse(res) {
          // Apollo includes `errors` in the response when empty, but the spec forbids this.
          // http://facebook.github.io/graphql/draft/#sec-Errors
          if (Object.prototype.hasOwnProperty.call(res, "errors") && (!res.errors || res.errors.filter((v) => !!v).length === 0)) {
            delete res.errors;
          }

          return res;
        },
        logFunction,
        schema: makeExecutableSchema({ typeDefs, resolvers, resolverValidationOptions })
      };
    })
  );

  // Start GraphiQL if enabled
  if (options.graphiql) {
    // GraphiQL endpoint
    expressServer.use(
      options.graphiqlPath || defaultServerConfig.graphiqlPath,
      graphiqlExpress({
        // GraphiQL options
        ...defaultServerConfig.graphiqlOptions,
        // endpoint of the graphql server where to send requests
        endpointURL: graphQLPath
      })
    );
  }

  return expressServer;
}
