import _ from "lodash";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import OnboardingNavBar from "./onboarding-navbar-component";
import { Media, Shops } from "/lib/collections";

export function composer(props, onData) {
  let brandMedia;

  const shop = Reaction.getShop();

  if (shop && Array.isArray(shop.brandAssets)) {
    const brandAsset =
      _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
    brandMedia = Media.findOne(brandAsset.mediaId);
  }

  onData(null, {
    shop,
    brandMedia
  });
}

registerComponent(
  "OnboardingNavBar",
  OnboardingNavBar,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(OnboardingNavBar);
