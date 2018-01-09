import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Products } from "/lib/collections";

import ShopStorefront from './shop-storefront-component';

class ShopStorefrontContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ShopStorefront
        {...this.props}
      />
    );
  }
}

function composer(props, onData) {
  const data = {};
  const shopSubscription = Meteor.subscribe("Shop");
  const marketplaceSubscription = Meteor.subscribe("MerchantShops");

  if (shopSubscription.ready()) {
    data.shop = Reaction.getShop();
  }

  if (marketplaceSubscription.ready()) {
    data.merchantShops = Reaction.getMerchantShops();
  }

  onData(null, data);
}

registerComponent(
  "ShopStorefront",
  ShopStorefrontContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(ShopStorefrontContainer);
