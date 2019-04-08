import Reaction from "/imports/plugins/core/core/server/Reaction";

import mutations from "./lib/mutations";
import queries from "./lib/queries";
import resolvers from "./lib/resolvers";
import schemas from "./lib/schemas";

Reaction.registerPackage({
  label: "Watchlist",
  name: "reaction-watchlist",
  icon: "fa fa-beer", // TODO
  autoEnable: true,

  graphQL: {
    resolvers,
    schemas
  },
  queries,
  mutations
  // catalog: {
  //   publishedProductVariantFields: ["saleId"]
  // },
  // functionsByType: {
  //   // mutateNewVariantBeforeCreate: [mutateNewVariantBeforeCreate],
  //   // publishProductToCatalog: [publishProductToCatalog]
  //   // registerPluginHandler: [registerPluginHandler],
  //   // startup: [startup]
  // }
});
