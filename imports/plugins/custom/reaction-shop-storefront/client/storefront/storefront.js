import "./footer-container";
import "./shop-grid-container";
import "./shop-grid-items-container";
import "./shop-storefront-container";
import "./shop-storefront-template.html";

import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

// this template is super unnecessary, but without it (where we simply tell the
// rendering engine to render ShopStorefront), the React rendering cycle is
// broken, and the component is rendered repeatedly (i.e., it is not updated, it
// is re-rendered). The result is every time you open/close an admin panel, the
// entire component is re-rendered with a temporary loading spinner, products
// re-fetched, etc. it's a bad UX. Using this super lightweight template
// resolves the issue. :shrug:
Template.shopStorefrontTemplate.helpers({
  component() {
    return Components.ShopStorefront;
  }
});
