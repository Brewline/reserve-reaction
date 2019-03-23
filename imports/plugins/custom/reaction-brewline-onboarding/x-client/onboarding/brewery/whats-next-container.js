import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { ReactionSale } from "@reaction/sale";
import { Reaction, Router } from "/client/api";
import { Products } from "/lib/collections";

import WhatsNext from "./whats-next-component";

function composer(props, onData) {
  let shop;
  let product;

  // use PrimaryShop as a proxy for the non-existent "Shop"
  const shopSubscription = Meteor.subscribe("PrimaryShop");
  const productsSubscription = Meteor.subscribe("Products");

  if (shopSubscription.ready()) {
    shop = Reaction.getShop();
  }

  if (productsSubscription.ready()) {
    product = Products.findOne({
      shopId: Reaction.getShopId(),
      UntappdId: { $nin: [null, false, ""] }
    });
  }

  const done = () => {
    if (!ReactionSale.goToSelectedSale()) {
      Router.go("index");
    }
  };

  onData(null, {
    ...props,
    shop,
    product,
    done
  });
}

registerComponent(
  "OnboardingBreweryWhatsNext",
  WhatsNext,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(WhatsNext);
