import ReactGA from "react-ga";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import {
  composeWithTracker,
  registerComponent
} from "@reactioncommerce/reaction-components";
import ReactionSale from "./reaction-sale";

import SaleAddProduct from "./sale-add-product-component";

const wrapComponent = (Comp) => (
  class SaleAddProductContainer extends Component {
    static propTypes = {
      sale: PropTypes.object
    }

    handleClickCreateProduct() {
      const actionView = {
        i18nKeyLabel: "productDetailEdit.productSettings",
        label: "Product Settings",
        template: "ProductAdmin"
      };

      if (!Reaction.isActionViewOpen()) {
        Reaction.showActionView();
      }

      Reaction.state.set("edit/focus", "productDetails");

      Reaction.setActionView(actionView);
      const { label } = actionView;

      ReactGA.event({
        category: "Sales",
        action: `Open ${label}`
      });
    }

    handleImportProductToSale = (untappdBeer, optionData) => {
      const { sale: { _id: saleId } } = this.props;
      const { bid: untappdProductId } = untappdBeer;
      const displayName = untappdBeer.beer_name || "???";

      Meteor.call("Sales/importUntappdProduct", saleId, untappdProductId, [optionData], (err, res) => {
        if (err || !res) {
          // TODO: correct wording
          if (err && err.reason) {
            Alerts.toast(err.reason, "error");
          }

          return Alerts.toast("Failed to import product from Untappd", "error");
        }

        Alerts.toast(`Successfully added ${displayName}.`, "success");
        Alerts.toast("Importing images (this can take a few minutes)", "info");

        ReactGA.event({
          category: "Can Releases",
          action: "Add Product",
          label: displayName
        });
      });
    }

    render() {
      return (
        <Comp
          {...this.props}
          onClickCreateProduct={this.handleClickCreateProduct}
          onImportProductToSale={this.handleImportProductToSale}
        />
      );
    }
  }
);

function composer(props, onData) {
  // listen for Can Releases (Sales)
  let sale;
  let shop;
  const salesSubscription = Meteor.subscribe("Sales");

  if (salesSubscription.ready()) {
    sale = ReactionSale.selectedSale();
  }

  if (Reaction.Subscriptions.MerchantShops.ready()) {
    shop = Reaction.getShop();
  }

  onData(null, {
    ...props,
    sale,
    shop
  });
}

registerComponent("SaleAddProduct", SaleAddProduct, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(SaleAddProduct);
