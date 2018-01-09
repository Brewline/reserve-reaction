import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

import "./shop-storefront.html";
import "./shop-grid-container";
import "./shop-grid-items-container";
import "./shop-storefront-container";

Template.shopStorefront.helpers({
  shopStorefrontProps() {
    return { component: Components.ShopStorefront };
  }
});
