import express from "express";
import mongodb, { MongoClient } from "mongodb";
import createApolloServer from "../../imports/plugins/core/graphql/server/createApolloServer";
import defineCollections from "../../imports/collections/defineCollections";
import mutations from "../../imports/plugins/core/graphql/server/mutations";
import queries from "../../imports/plugins/core/graphql/server/queries";
import setUpFileCollections from "../../imports/plugins/core/files/server/no-meteor/setUpFileCollections";
import methods from "./methods";

const { MONGO_URL, ROOT_URL } = process.env;
if (!MONGO_URL) throw new Error("You must set MONGO_URL");
if (!ROOT_URL) throw new Error("You must set ROOT_URL");

const lastSlash = MONGO_URL.lastIndexOf("/");
const dbUrl = MONGO_URL.slice(0, lastSlash);
const dbName = MONGO_URL.slice(lastSlash + 1);
const PORT = 3030;

let mongoClient;
let db;

const collections = {};

MongoClient.connect(dbUrl, (error, client) => {
  if (error) throw error;
  console.info("Connected to MongoDB");
  mongoClient = client;
  db = client.db(dbName);
  defineCollections(db, collections);

  const { downloadManager, Media } = setUpFileCollections({
    absoluteUrlPrefix: ROOT_URL,
    db,
    Logger: { info: console.info.bind(console) },
    MediaRecords: collections.MediaRecords,
    mongodb
  });

  // Make the Media collection available to resolvers
  collections.Media = Media;

  /**
   * This is a server for development of the GraphQL API without needing
   * to run Meteor. After finishing development, you should still test
   * the API changes through the Meteor app in case there are any differences.
   */
  const app = createApolloServer({
    context: {
      collections,
      methods,
      mutations,
      queries
    },
    debug: true,
    graphiql: true
  });

  app.use("/assets/files", downloadManager.connectHandler);

  app.use(express.static('public'))

  app.listen(PORT, () => {
    console.info(`GraphQL listening at http://localhost:${PORT}/graphql-alpha`);
    console.info(`GraphiQL UI: http://localhost:${PORT}/graphiql`);
  });
});
