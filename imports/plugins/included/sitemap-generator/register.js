import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Sitemap Generator",
  name: "reaction-sitemap-generator",
  icon: "fa fa-vine",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  mutations
});
