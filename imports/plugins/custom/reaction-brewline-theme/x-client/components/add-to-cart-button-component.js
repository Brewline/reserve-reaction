import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

export const ErrorState = Object.freeze({
  backorder: "backorder",
  limitReached: "limitReached",
  lowQuantity: "lowQuantity",
  missingProductOption: "missingProductOption",
  ok: "ok",
  saleEnded: "saleEnded",
  salePending: "salePending",
  soldOut: "soldOut",
  unpublished: "unpublished"
});

const errorStateQuantityMap = {
  [ErrorState.backorder]: {
    display: false
  },
  [ErrorState.limitReached]: {
    disabled: true
  },
  [ErrorState.lowQuantity]: {
    status: "warning"
  },
  [ErrorState.missingProductOption]: {
    display: false
  },
  [ErrorState.ok]: {
    status: "primary"
  },
  [ErrorState.saleEnded]: {
    display: false
  },
  [ErrorState.salePending]: {
    display: false
  },
  [ErrorState.soldOut]: {
    disabled: true
  },
  [ErrorState.unpublished]: {
    display: false
  }
};

const errorStateButtonTextMap = {
  [ErrorState.backorder]: {
    label: "Get Notified",
    i18nKeyLabel: "productDetail.backorder",
    disabled: true
  },
  [ErrorState.limitReached]: {
    label: "Limit Reached",
    i18nKeyLabel: "productDetail.limitReached",
    disabled: true
  },
  [ErrorState.lowQuantity]: {
    label: "Add to Cart",
    i18nKeyLabel: "productDetail.addToCart",
    status: "warning"
  },
  [ErrorState.missingProductOption]: {
    label: "Add Product Option",
    i18nKeyLabel: "productDetail.missingProductOption",
    status: "danger"
  },
  [ErrorState.ok]: {
    label: "Add to cart",
    i18nKeyLabel: "productDetail.addToCart",
    status: "primary"
  },
  [ErrorState.saleEnded]: {
    label: "Sale has ended",
    i18nKeyLabel: "productDetail.saleEnded",
    status: "info"
  },
  [ErrorState.salePending]: {
    label: "Sale has not begun",
    i18nKeyLabel: "productDetail.salePending",
    status: "info"
  },
  [ErrorState.soldOut]: {
    label: "Sold Out",
    i18nKeyLabel: "productDetail.soldOut",
    disabled: true
  },
  [ErrorState.unpublished]: {
    label: "Unpublished",
    i18nKeyLabel: "productDetail.unpublished",
    disabled: true
  }
};

const ErrorStateValues = [];
Object.keys(ErrorState).forEach((k) => ErrorStateValues.push(ErrorState[k]));

class AddToCartButtonWithLimit extends Component {
  static propTypes = {
    cartQuantities: PropTypes.object,
    editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    errorState: PropTypes.oneOf(ErrorStateValues),
    onAddToCart: PropTypes.func,
    onCartQuantityChange: PropTypes.func,
    productOptions: PropTypes.array, // [productOptionPropType]
    productVariant: PropTypes.object
  };

  static ErrorState = ErrorState;

  get hasError() {
    const { errorState } = this.props;

    return errorState && errorState !== ErrorState.ok;
  }

  getErrorStateButtonProps() {
    const { errorState } = this.props;

    if (!errorState) {
      return errorStateButtonTextMap[ErrorState.ok];
    }

    return errorStateButtonTextMap[errorState];
  }

  getErrorStateInputProps() {
    const { errorState } = this.props;

    if (!errorState) {
      return errorStateQuantityMap[ErrorState.ok];
    }

    return errorStateQuantityMap[errorState];
  }

  handleCartQuantityChange = (event, productOption) => {
    if (!this.props.onCartQuantityChange) { return; }

    this.props.onCartQuantityChange(productOption, event, event.target.value);
  }

  renderAddToCartButton(productOption, key) {
    let inputElement;
    const buttonProps = this.getErrorStateButtonProps();
    // may not be the best default
    const { status = "disabled" } = buttonProps;
    const {
      status: inputStatus = "disabled",
      display: displayInput,
      ...inputProps
    } = this.getErrorStateInputProps();

    if (displayInput) {
      inputElement = (
        <input
          className={`form-control input-md status-${inputStatus}`}
          id="add-to-cart-quantity"
          min="1"
          max={productOption.inventoryLimit || 100}
          name="addToCartQty"
          onChange={(e) => this.handleCartQuantityChange(e, productOption)}
          type="number"
          value={this.props.cartQuantities[productOption._id] || 1}
          {...inputProps}
        />
      );
    }

    return (
      <div className={`pdp add-to-cart block status-${status}`} key={key}>
        {inputElement}

        <Components.Button
          className="input-group-addon add-to-cart-text js-add-to-cart"
          onClick={
            () => this.props.onAddToCart(
              this.props.productVariant,
              productOption
            )
          }
          {...buttonProps}
        />
      </div>
    );
  }

  render() {
    const { productOptions } = this.props;

    if (!productOptions || !productOptions.length) {
      if (this.props.editable) {
        return (
          <Components.Translation
            defaultValue="Add options to enable 'Add to Cart' button"
            i18nKey="productVariant.addVariantOptions"
          />
        );
      }

      return null;
    }

    return (
      <Fragment>
        {productOptions.map((o, i) => this.renderAddToCartButton(o, i))}
      </Fragment>
    );
  }
}

registerComponent("AddToCartButtonWithLimit", AddToCartButtonWithLimit);

export default AddToCartButtonWithLimit;
