import React, { Component } from "react";

import VariantFormContainer from "/imports/plugins/included/product-variant/containers/variantFormContainer";

import { compose } from "recompose";
import { replaceComponent } from "@reactioncommerce/reaction-components";
// import { ReactionProduct } from "/lib/api";
import InventoryLimitVariantForm from "./variant-form-component-decorator";

const wrapComponent = (Comp) => (
  class InventoryLimitVariantFormContainer extends VariantFormContainer {
    constructor(props) {
      super(props);
    }

    updateLimitIfChildVariants = (variant) => {
    }

    render() {
      if (this.props.variant) {
        return (
          <Comp
            isProviderEnabled={this.isProviderEnabled}
            fetchTaxCodes={this.fetchTaxCodes}
            hasChildVariants={this.hasChildVariants}
            greyDisabledFields={this.greyDisabledFields}
            restoreVariant={this.restoreVariant}
            removeVariant={this.removeVariant}
            cloneVariant={this.cloneVariant}
            onVariantFieldSave={this.handleVariantFieldSave}
            onVisibilityButtonClick={this.handleVariantVisibilityToggle}
            onCardExpand={this.handleCardExpand}
            onUpdateQuantityField={this.updateQuantityIfChildVariants}
            onUpdateInventoryLimitField={this.updateLimitIfChildVariants}
            validation={this.state.validationStatus}
            isDeleted={this.state.isDeleted}
            {...this.props}
            variant={this.props.variant}
          />
        );
      }

      return null;
    }
  }
);

replaceComponent("VariantForm", InventoryLimitVariantForm, wrapComponent);

export default compose(
  wrapComponent
)(InventoryLimitVariantForm);
