import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Products, Media } from "/lib/collections";

import ShopStorefront from './shop-storefront-component';

function composer(props, onData) {
  let shop, brandMedia, merchantShops; // TODO: move merchantShops to ShopGrid

  const shopSubscription = Meteor.subscribe("Shop");
  const merchantShopsSubscription = Meteor.subscribe("MerchantShops");

  if (shopSubscription.ready()) {
    shop = Reaction.getShop();
  }

  if (merchantShopsSubscription.ready()) {
    merchantShops = Reaction.getMerchantShops();
  }

  if (shop && Array.isArray(shop.brandAssets)) {
    // it's strange to pluck 'navbarBrandImage', but it works
    const brandAsset =
      _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");

    if (brandAsset && brandAsset.mediaId) {
      brandMedia = Media.findOne(brandAsset.mediaId);
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
