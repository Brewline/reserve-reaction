import ReactGA from "react-ga";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

import SaleDetailSimpleToolbar from "./sale-detail-simple-toolbar-component";

function showActionView(actionView) {
  if (!Reaction.isActionViewOpen()) {
    Reaction.showActionView();
  }

  Reaction.state.set("edit/focus", "saleDashboard");
  Reaction.setActionView(actionView);

  const { label } = actionView;

  ReactGA.event({
    category: "Sales",
    action: `Open ${label}`
  });
}

const wrapComponent = (Comp) => (
  class SaleDetailSimpleToolbarContainer extends Component {
    handleAddProduct = () => {
      showActionView({
        i18nKeyLabel: "saleDetailEdit.saleDashboard",
        label: "Sale Dashboard",
        template: "SaleAddProduct"
      });
    }

    handleEdit = () => {
      showActionView({
        i18nKeyLabel: "saleDetailEdit.saleDashboard",
        label: "Sale Dashboard",
        template: "SaleDashboard"
      });
    }

    render() {
      return (
        <Comp
          onAddProduct={this.handleAddProduct}
          onEdit={this.handleEdit}
        />
      );
    }
  }
);

function composer(props, onData) {
  const userId = Meteor.userId();
  const shopId = Reaction.getShopId();

  onData(null, {
    hasCreateProductAccess: Reaction.hasPermission("createProduct", userId, shopId)
  });
}

registerComponent("SaleDetailSimpleToolbar", SaleDetailSimpleToolbar, [
  wrapComponent,
  composeWithTracker(composer)
]);

// Decorate component and export
export default compose(
  wrapComponent,
  composeWithTracker(composer)
)(SaleDetailSimpleToolbar);
