import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import { Router } from "/client/modules/router";

import ShopStorefront from "./shop-storefront-component";

function composer(props, onData) {
  let shop;
  let brandMedia;
  let merchantShops;
  let isPrimaryShop;

  // use PrimaryShop as a proxy for Shop
  const shopSubscription = Meteor.subscribe("PrimaryShop");
  const merchantShopsSubscription = Meteor.subscribe("MerchantShops");

  if (shopSubscription.ready()) {
    shop = Reaction.getShop();

    isPrimaryShop = Reaction.getPrimaryShopId() === shop._id;
  }

  if (merchantShopsSubscription.ready()) {
    merchantShops = Reaction.getMerchantShops();

    if (isPrimaryShop && (!merchantShops || !merchantShops.length)) {
      Router.go("brewlineOnboardingBrewery");
    }
  }

  if (shop && Array.isArray(shop.brandAssets)) {
    // it's strange to pluck 'navbarBrandImage', but it works
    const brandAsset =
      _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");

    if (brandAsset && brandAsset.mediaId) {
      brandMedia = Media.findOneLocal(brandAsset.mediaId);
    }
  }

  onData(null, { shop, brandMedia, merchantShops });
}

registerComponent(
  "ShopStorefront",
  ShopStorefront,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(ShopStorefront);
