import "./storefront/storefront";

import { Session } from "meteor/session";

Session.set("INDEX_OPTIONS", {
  // template: "ShopStorefront",
  template: "shopStorefrontTemplate",
  layoutHeader: "NavBar",
  layoutFooter: "Footer",
  notFound: "notFound",
  dashboardControls: "dashboardControls",
  adminControlsFooter: "adminControlsFooter"
});
