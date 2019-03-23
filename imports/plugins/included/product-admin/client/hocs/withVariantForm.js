import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { Validation } from "@reactioncommerce/schemas";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next } from "/client/api";
import Logger from "/client/modules/logger";
import { ProductVariant } from "/lib/collections/schemas";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import withTaxCodes from "/imports/plugins/core/taxes/client/hoc/withTaxCodes";

const wrapComponent = (Comp) => (
  class VariantFormContainer extends Component {
    static propTypes = {
      history: PropTypes.object,
      variant: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.validation = new Validation(ProductVariant);

      this.state = {
        isDeleted: props.variant && props.variant.isDeleted,
        validationStatus: this.validation.validationStatus
      };
    }

    componentDidMount() {
      this.runVariantValidation(this.props.variant);
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
      this.setState({
        isDeleted: nextProps.variant && nextProps.variant.isDeleted
      });
    }

    runVariantValidation(variant) {
      if (variant) {
        const validationStatus = this.validation.validate(variant);

        this.setState(() => ({
          validationStatus
        }));

        return validationStatus;
      }

      return null;
    }

    hasChildVariants = (variant) => {
      if (ReactionProduct.checkChildVariants(variant._id) > 0) {
        return true;
      }
      return false;
    }

    greyDisabledFields = (variant) => {
      if (this.hasChildVariants(variant)) {
        return { backgroundColor: "lightgrey", cursor: "not-allowed" };
      }
    }

    restoreVariant = (variant) => {
      const title = variant.title || i18next.t("productDetailEdit.thisVariant");

      Alerts.alert({
        title: i18next.t("productDetailEdit.restoreVariantConfirm", { title }),
        showCancelButton: true,
        confirmButtonText: "Restore"
      }, (isConfirm) => {
        if (isConfirm) {
          const id = variant._id;
          Meteor.call("products/updateProductField", id, "isDeleted", false, (error) => {
            if (error) {
              Alerts.alert({
                text: i18next.t("productDetailEdit.restoreVariantFail", { title }),
                confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
              });
            }
            this.setState({
              isDeleted: !this.state.isDeleted
            });
          });
        }
      });
    }

    removeVariant = (variant, redirectUrl) => {
      const id = variant._id;
      Meteor.call("products/deleteVariant", id, (error, result) => {
        if (result && ReactionProduct.selectedVariantId() === id) {
          redirectUrl && this.props.history.replace(redirectUrl);
        }
      });
    }

    cloneVariant = (productId, variantId) => {
      const title = i18next.t("productDetailEdit.thisVariant");
      if (!productId) {
        return;
      }

      Meteor.call("products/cloneVariant", productId, variantId, (error) => {
        if (error) {
          Alerts.alert({
            text: i18next.t("productDetailEdit.cloneVariantFail", { title }),
            confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
          });
        }
      });
    }

    handleVariantFieldSave = (variantId, fieldName, value, variant) => {
      const validationStatus = this.runVariantValidation(variant);
      if (!validationStatus) return;

      // validationStatus has a `isFieldValid` method, but it incorrectly returns
      // `false` when the field doesn't exist, such as when you clear an optional field
      // and save it.
      const fieldIsValid = !validationStatus.fields[fieldName] || validationStatus.fields[fieldName].isValid;
      if (!fieldIsValid) {
        Logger.error(`${fieldName} field is invalid`);
        return;
      }

      Meteor.call("products/updateProductField", variantId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
        }

        if (fieldName === "inventoryPolicy") {
          this.updateInventoryPolicyIfChildVariants(variant);
        }

        if (fieldName === "lowInventoryWarningThreshold") {
          this.updateLowInventoryThresholdIfChildVariants(variant);
        }
      });
    }

    handleCardExpand = (cardName) => {
      Reaction.state.set("edit/focus", cardName);
    }

    handleVariantVisibilityToggle = (variant) => {
      Meteor.call("products/updateProductField", variant._id, "isVisible", !variant.isVisible);
    }

    /**
     * @summary update parent inventory policy if variant has children
     * @param {Object} variant product or variant document
     * @return {undefined} return nothing
     * @private
     */
    updateInventoryPolicyIfChildVariants = (variant) => {
      // Get all siblings, including current variant
      const options = ReactionProduct.getSiblings(variant);
      // Get parent
      const parent = ReactionProduct.getVariantParent(variant);

      // If this is not a top-level variant, update top-level inventory policy as well
      if (parent && options && options.length) {
        // Check to see if every variant option inventory policy is true
        const inventoryPolicy = options.every((option) => option.inventoryPolicy === true);

        // If all inventory policies on children are true, update parent to be true
        if (inventoryPolicy === true) {
          return Meteor.call("products/updateProductField", parent._id, "inventoryPolicy", true, (error) => {
            if (error) {
              Alerts.toast(error.message, "error");
            }
          });
        }
        // If any child has a false inventoryPolicy, update parent to be false
        return Meteor.call("products/updateProductField", parent._id, "inventoryPolicy", false, (error) => {
          if (error) {
            Alerts.toast(error.message, "error");
          }
        });
      }
    }

    updateLowInventoryThresholdIfChildVariants = (variant) => {
      // Check to see if this variant has options attached to it
      const variantOptions = ReactionProduct.getVariants(variant._id);

      if (variantOptions && variantOptions.length !== 0) {
        variantOptions.forEach((option) =>
          Meteor.call("products/updateProductField", option._id, "lowInventoryWarningThreshold", variant.lowInventoryWarningThreshold, (error) => {
            if (error) {
              Alerts.toast(error.message, "error");
            }
          }));
      }
    }

    render() {
      if (this.props.variant) {
        return (
          <Comp
            hasChildVariants={this.hasChildVariants}
            greyDisabledFields={this.greyDisabledFields}
            restoreVariant={this.restoreVariant}
            removeVariant={this.removeVariant}
            cloneVariant={this.cloneVariant}
            onVariantFieldSave={this.handleVariantFieldSave}
            onVisibilityButtonClick={this.handleVariantVisibilityToggle}
            onCardExpand={this.handleCardExpand}
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

const composer = async (props, onData) => {
  const [shopId] = await getOpaqueIds([{ namespace: "Shop", id: Reaction.getShopId() }]);

  onData(null, {
    shopId
  });
};

export default compose(
  withRouter,
  composeWithTracker(composer),
  withTaxCodes,
  wrapComponent
);
