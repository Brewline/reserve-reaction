import { Meteor } from "meteor/meteor";
import _ from "lodash";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";

import Footer from "./footer-component";

function composer(props, onData) {
  let primaryShop;
  let primaryShopMedia;

  // use PrimaryShop as a proxy for Shop
  const shopSubscription = Meteor.subscribe("PrimaryShop");

  if (shopSubscription.ready()) {
    primaryShop = Reaction.getShop(Reaction.getPrimaryShopId());
  }

  if (primaryShop && Array.isArray(primaryShop.brandAssets)) {
    const brandAsset =
      _.find(primaryShop.brandAssets, (a) => a.type === "navbarBrandImage");

    if (brandAsset && brandAsset.mediaId) {
      primaryShopMedia = Media.findOneLocal(brandAsset.mediaId);
    }
  }

  onData(null, { primaryShop, primaryShopMedia });
}

registerComponent(
  "Footer",
  Footer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(Footer);
