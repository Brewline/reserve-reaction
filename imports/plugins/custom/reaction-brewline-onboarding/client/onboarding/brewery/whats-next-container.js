import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Products } from "/lib/collections";

import WhatsNext from './whats-next-component';

function composer(props, onData) {
  let shop, product;

  const shopSubscription = Meteor.subscribe("Shop");
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

  onData(null, {
    ...props,
    shop,
    product
  });
}

registerComponent(
  "OnboardingBreweryWhatsNext",
  WhatsNext,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(WhatsNext);
