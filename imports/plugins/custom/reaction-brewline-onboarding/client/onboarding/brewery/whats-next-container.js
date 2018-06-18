import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";
import { Products } from "/lib/collections";

import WhatsNext from "./whats-next-component";

function composer(props, onData) {
  let shop, product;

  // use PrimaryShop as a proxy for the non-existant "Shop"
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
    // Go to product? might be confusing. let's go to shop in all cases.
    // if (product) {
    //   Router.go("product", { handle: product._id });
    // } else {
    Router.go("index");
    // }
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
