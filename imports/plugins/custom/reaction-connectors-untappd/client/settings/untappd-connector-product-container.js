import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { default as ReactionAlerts } from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";

import UntappdConnectorProduct from "./untappd-connector-product-component";

class UntappdConnectorProductContainer extends Component {
  constructor(props) {
    super(props);

    this.addProduct = this.addProduct.bind(this);

    // // initial state
    const alertId = "connectors-untappd-add-product";

    this.state = {
      alertOptions: {
        placement: alertId,
        id: alertId,
        autoHide: 4000
      }
    };
  }

  addProduct(productId) {
    Meteor.call("connectors/untappd/import/products", productId, (err, res) => {
      if (err) {
        // TODO: correct wording
        return ReactionAlerts.add(
          err.reason,
          "danger",
          Object.assign({}, this.state.alertOptions, {
            i18nKey: "admin.settings.createGroupError"
          })
        );
      }
      // TODO: correct wording
      return ReactionAlerts.add(
        "Product Added to Shop. Processing Images...",
        "success",
        Object.assign({}, this.state.alertOptions, {
          i18nKey: "admin.settings.createGroupError"
        })
      );
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
