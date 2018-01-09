import { Template } from "meteor/templating";
import "./shop-storefront.html";
import "./shop-storefront-container";
import { Components } from "@reactioncommerce/reaction-components";

Template.shopStorefront.helpers({
  shopStorefrontProps() {
    return { component: Components.ShopStorefront };
  }
});
