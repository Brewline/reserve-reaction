import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { default as ReactionAlerts } from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";

import UntappdMarketplaceShop from './untappd-marketplace-shop-component';

class UntappdMarketplaceShopContainer extends Component {
  constructor(props) {
    super(props);

    this.addShop = this.addShop.bind(this);

    //// initial state
    const alertId = "connectors-untappd-add-shop";

    this.state = {
      alertOptions: {
        placement: alertId,
        id: alertId,
        autoHide: 4000
      }
    };
  }

  addShop(untappdShopId) {
    Meteor.call("connectors/untappd/import/shops", untappdShopId, (err, shop) => {
      if (err) {
        // TODO: correct wording
        return ReactionAlerts.add(
          err.reason,
          "danger",
          Object.assign({}, this.state.alertOptions, {
            i18nKey: "admin.settings.createGroupError"
          })
        );
      } else {
        Reaction.setShopId(shop._id);
      }
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
