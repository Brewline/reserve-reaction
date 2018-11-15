import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

// grab the actual class (vs Components.ProductField) to be sure it is defined,
// otherwise we may not be able to extend it.
import ProductField from "/imports/plugins/included/product-detail-simple/client/components/productField.js";

class SaleField extends ProductField {
  handleFocus = () => {
    // Open actionView, if not already open
    if (!Reaction.isActionViewOpen()) {
      Reaction.showActionView();
    }

    // Open actionView to saleDetails panel
    Reaction.state.set("edit/focus", "saleDetails");

    Reaction.setActionView({
      i18nKeyLabel: "saleDetailEdit.saleDashboard",
      label: "Sale Dashboard",
      template: "saleDashboard"
    });
  }
}

const wrapComponent = (Comp) => (
  class SaleFieldContainer extends Component {
    static propTypes = {
      ...ProductField.propTypes, // may not be defined yet
      sale: PropTypes.object
    };

    render() {
      return (
        <Comp
          {...this.props}
          product={this.props.sale}
        />
      );
    }
  }
);

registerComponent("SaleField", SaleField, wrapComponent);

export default compose(wrapComponent)(SaleField);
