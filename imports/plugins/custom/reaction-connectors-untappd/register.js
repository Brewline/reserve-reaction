import { BrowserPolicy } from "meteor/browser-policy-common";
import Reaction from "/imports/plugins/core/core/server/Reaction";

import queries from "./lib/queries";
import resolvers from "./lib/resolvers";
import schemas from "./lib/schemas";

Reaction.registerPackage({
  label: "Untappd Connect",
  name: "reaction-connectors-untappd",
  icon: "fa fa-exchange",

  graphQL: {
    resolvers,
    schemas
  },
  queries,

  autoEnable: true,
  settings: {
    apiKey: "",
    password: "",
    sharedSecret: "",
    shopName: "",
    webhooks: []
  },
  registry: [{
    label: "Import Beers from Untappd",
    name: "settings/connectors/untappd",
    icon: "fa fa-exchange",
    route: "/dashboard/connectors/untappd",
    provides: ["connectorSettings"],
    container: "dashboard",
    template: "untappdConnectSettings"
  }, {
    label: "Untappd Marketplace Shops",
    name: "untappdMarketplaceShops",
    icon: "fa fa-globe",
    route: "shop/settings/untappd",
    provides: ["shopSettings"],
    container: "dashboard",
    template: "untappdMarketplaceShops",
    showForShopTypes: ["primary"],
    permissions: [{
      label: "Marketplace Shops",
      permission: "marketplaceShops"
    }]
  }]
});

BrowserPolicy.content.allowOriginForAll("*.akamaized.net");
