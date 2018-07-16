import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";

import UntappdMarketplaceShop from "./untappd-marketplace-shop-component";

class UntappdMarketplaceShopContainer extends Component {
  constructor(props) {
    super(props);

    this.addShop = this.addShop.bind(this);

    // initial state
    const alertId = "connectors-untappd-add-shop";

    this.state = {
      alertOptions: {
        placement: alertId,
        id: alertId,
        autoHide: 4000
      }
    };
  }

  getShopName(defaultValue) {
    const {
      brewery: {
        brewery_name: breweryName
      }
    } = this.props;

    return breweryName || defaultValue;
  }

  addShop(untappdShopId) {
    const msg = `Importing ${this.getShopName("your shop")} from Untappd...`;
    Alerts.toast(msg, "info");

    Meteor.call("connectors/untappd/import/shops", untappdShopId, (err, shop) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      // TODO: correct wording
      Alerts.toast(`${this.getShopName("Shop")} created`, "success");

      Reaction.setShopId(shop._id);
    });
  }

  render() {
    return (
      <UntappdMarketplaceShop
        {...this.props}
        onAddShop={this.addShop}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, props);
}

registerComponent(
  "UntappdMarketplaceShop",
  UntappdMarketplaceShopContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(UntappdMarketplaceShopContainer);
