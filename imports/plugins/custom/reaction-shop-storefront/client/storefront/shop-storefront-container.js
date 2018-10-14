import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Accounts } from "/lib/collections";
import { Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import { Router } from "/client/modules/router";
import { Sales } from "@brewline/sale/lib/collections";

import ShopStorefront from "./shop-storefront-component";

function composer(props, onData) {
  let brandMedia;
  let isPrimaryShop;
  let merchantShops;
  let primaryShopId;
  let sales;
  let shop;
  let userAccount;

  if (Reaction.Subscriptions.UserProfile.ready()) {
    userAccount = Accounts.findOne({ _id: Meteor.userId() });
  }

  if (Reaction.Subscriptions.MerchantShops.ready()) {
    primaryShopId = Reaction.getPrimaryShopId();
    shop = Reaction.getShop();
    merchantShops = Reaction.getMerchantShops();
    isPrimaryShop = shop && primaryShopId === shop._id;

    if (isPrimaryShop === true) {
      const userAccountShopId = userAccount && userAccount.shopId;

      if (Reaction.hasPermission("owner", Meteor.userId(), userAccountShopId)) {
        Reaction.setShopId(userAccount.shopId);
      } else if (!merchantShops || !merchantShops.length) {
        Router.go("brewlineOnboarding");
        return;
      }
    }
  }

  if (Reaction.Subscriptions.Sales.ready()) {
    sales = Sales.find({});
  }

  if (shop && Array.isArray(shop.brandAssets)) {
    // it's strange to pluck 'navbarBrandImage', but it works
    const brandAsset =
      _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");

    if (brandAsset && brandAsset.mediaId) {
      brandMedia = brandAsset && Media.findOneLocal(brandAsset.mediaId);
    }
  }

  onData(null, { ...props, shop, sales, brandMedia, merchantShops });
}

const trackedComponent = composeWithTracker(composer);

registerComponent("ShopStorefront", ShopStorefront, trackedComponent);

export default trackedComponent(ShopStorefront);
