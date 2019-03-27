import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

import UntappdConnectorProduct from "./untappd-connector-product-component";

class UntappdConnectorProductContainer extends Component {
  getProductName(defaultValue) {
    const {
      product: {
        beer: {
          beer_name: beerName
        }
      }
    } = this.props;

    return beerName || defaultValue;
  }

  addProduct = (productId) => {
    const msg = `Importing ${this.getProductName("Product")} from Untappd...`;
    Alerts.toast(msg, "info");

    Meteor.call("connectors/untappd/import/products", productId, (err, _res) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      // this is a HACK to trigger a re-render of the ProductGrid is somehow
      // not reactive to this update.
      Reaction.hideActionView();

      // TODO: correct wording
      Alerts.toast(`${this.getProductName("Product")} Added to Shop. Processing Images...`, "success");
    });
  }

  render() {
    return (
      <UntappdConnectorProduct
        {...this.props}
        onAddProduct={this.addProduct}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, props);
}

registerComponent(
  "UntappdConnectorProduct",
  UntappdConnectorProductContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(UntappdConnectorProductContainer);
