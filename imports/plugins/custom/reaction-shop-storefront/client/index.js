import "./storefront/storefront";

import { Session } from "meteor/session";

Session.set("INDEX_OPTIONS", {
  template: "ShopStorefront",
  layoutHeader: "NavBar",
  layoutFooter: "Footer",
  notFound: "notFound",
  dashboardControls: "dashboardControls",
  adminControlsFooter: "adminControlsFooter"
});
