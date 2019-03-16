import React from "react"; // :shrug:
import PropTypes from "prop-types";
import { $ } from "meteor/jquery";
import { Cart, Products } from "/lib/collections";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger, Router } from "/client/api";
import { Components, replaceComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import Super from "/imports/plugins/included/product-variant/components/productGridItems";

import { AddToCartErrorState } from "@brewline/theme";
import ReactionSale from "./reaction-sale";

class SaleProductGridItemsCustomer extends Super {
  static propTypes = {
    ...Super.propTypes,
    sale: PropTypes.object,
    storedCart: PropTypes.object
  };

  state = {
    cartQuantities: {}
  }

  get hasSale() {
    const { sale } = this.props;

    return !!sale;
  }

  get pdpPath() {
    const { product: { handle }, sale } = this.props;

    if (!this.hasSale) {
      return super.pdpPath;
    }

    return Router.pathFor("saleProduct", {
      hash: {
        idOrSlug: sale.slug,
        productSlug: handle
      }
    });
  }

  getStoredQuantity(productOption) {
    const { storedCart } = this.props;

    if (!storedCart || !storedCart.items) { return 0; }

    storedCart.items.forEach((item) => {
      if (item.variants._id === productOption._id) {
        return item.quantity;
      }
    });

    return 0;
  }

  handleCartQuantityChange = (productOption, event, quantity) => {
    const { cartQuantities } = this.state;

    cartQuantities[productOption._id] = Math.max(quantity, 1);

    this.setState({ cartQuantities });
  };

  handleClick = (event) => {
    if (!Reaction.hasPermission("createProduct") || !Reaction.isPreview()) {
      return Reaction.Router.go(this.pdpPath);
    }

    return super.handleClick(event);
  }

  handleSlideIn(alertWidth, direction, oppositeDirection) {
    // Animate slide in
    return $(".cart-alert").animate(
      {
        [oppositeDirection]: "auto",
        [direction]: -alertWidth
      },
      {
        duration: 600,
        complete() {
          $(".cart-alert").hide();
        }
      }
    );
  }

  handleAddToCart = (productVariant, productOption) => {
    let quantity;
    let totalQuantity;

    if (!productOption) { return null; }

    if (productOption.inventoryPolicy && productOption.inventoryQuantity < 1) {
      Alerts.inline("Sorry, this item is out of stock!", "warning", {
        placement: "productDetail",
        i18nKey: "productDetail.outOfStock",
        autoHide: 10000
      });
      return [];
    }

    const storedQuantity = this.getStoredQuantity(productOption);

    quantity = parseInt(this.state.cartQuantities[productOption._id] || 1, 10);
    totalQuantity = quantity + storedQuantity;
    const maxQuantity = productOption.inventoryQuantity;

    if (quantity < 1) {
      quantity = 1;
    }

    if (productOption.inventoryPolicy && quantity > maxQuantity && storedQuantity < maxQuantity) {
      Alerts.inline("Your product quantity has been adjusted to the max quantity in stock", "warning", {
        placement: "productDetail",
        i18nKey: "admin.inventoryAlerts.adjustedQuantity",
        autoHide: 10000
      });
      quantity = maxQuantity - storedQuantity;
      totalQuantity = maxQuantity;
    }

    if (
      productOption.inventoryPolicy &&
      totalQuantity > maxQuantity &&
      storedQuantity < maxQuantity &&
      quantity < maxQuantity
    ) {
      Alerts.inline("Your product quantity has been adjusted to the max quantity in stock", "warning", {
        placement: "productDetail",
        i18nKey: "admin.inventoryAlerts.adjustedQuantity",
        autoHide: 10000
      });
      quantity = maxQuantity - storedQuantity;
      totalQuantity = maxQuantity;
    }

    if (productOption.inventoryLimit > 0 && totalQuantity > productOption.inventoryLimit && storedQuantity < maxQuantity) {
      Alerts.inline("Your product quantity has been adjusted to the max quantity allowable per order", "warning", {
        placement: "productDetail",
        i18nKey: "admin.inventoryAlerts.adjustedQuantityViaLimit",
        autoHide: 10000
      });
      quantity = productOption.inventoryLimit - storedQuantity;
      totalQuantity = productOption.inventoryLimit;
    }

    if (productOption.inventoryPolicy && totalQuantity > maxQuantity) {
      Alerts.inline("Sorry, this item is out of stock!", "error", {
        placement: "productDetail",
        i18nKey: "productDetail.outOfStock",
        autoHide: 10000
      });
      return [];
    }

    const productId = productVariant.ancestors[0]; // should only be one

    if (productId) {
      Meteor.call("cart/addToCart", productId, productOption._id, quantity, (error) => {
        if (error) {
          Logger.error(error, "Failed to add to cart.");

          Alerts.inline("Uh oh, something we wrong adding to your cart!", "error", {
            placement: "productDetail",
            i18nKey: "productDetail.addToCartError",
            autoHide: 10000
          });

          return error;
        }
        // Reset cart quantity on success
        this.handleCartQuantityChange(productOption, 1);

        this.setState(({ productClick }) => ({
          productClick: productClick + 1
        }));

        return true;
      });
    }

    // template.$(".variant-select-option").removeClass("active");
    ReactionProduct.setCurrentVariant(null);
    // qtyField.val(1);
    // scroll to top on cart add
    $("html,body").animate(
      {
        scrollTop: 0
      },
      0
    );
    // slide out label
    const addToCartText = i18next.t("productDetail.addedToCart");
    const addToCartTitle = productOption.title || "";
    // Grab and cache the width of the alert to be used in animation
    const alertWidth = $(".cart-alert").width();
    const direction = i18next.dir() === "rtl" ? "left" : "right";
    const oppositeDirection = i18next.dir() === "rtl" ? "right" : "left";
    if ($(".cart-alert").css("display") === "none") {
      $("#spin").addClass("hidden");
      $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);
      this.handleSlideOut(alertWidth, direction, oppositeDirection);
      this.animationTimeOut = setTimeout(() => {
        this.handleSlideIn(alertWidth, direction, oppositeDirection);
      }, 4000);
    } else {
      clearTimeout(this.textTimeOut);

      // hides text and display spinner
      $(".cart-alert-text").hide();
      $("#spin").removeClass("hidden");

      this.textTimeOut = setTimeout(() => {
        $("#spin").addClass("hidden");
        $(".cart-alert-text").text(`${this.state.productClick * quantity} ${addToCartTitle} ${addToCartText}`);
        $(".cart-alert-text").fadeIn("slow");
        if (this._isMounted) {
          this.setState({ productClick: 0 });
        }
      }, 2000);

      clearTimeout(this.animationTimeOut);
      this.animationTimeOut = setTimeout(() => {
        this.handleSlideIn(alertWidth, direction, oppositeDirection);
      }, 4000);
    }
  };

  getErrorState() {
    const {
      product: { isSoldOut, isLowQuantity, isBackorder },
      productOptions,
      // productVariant,
      sale = {}
    } = this.props;
    const now = new Date();

    if (!productOptions || !productOptions.length) {
      return AddToCartErrorState.missingProductOption;
    }
    if (sale.beginsAt > now) {
      return AddToCartErrorState.salePending;
    }
    if (sale.endsAt < now) {
      return AddToCartErrorState.saleEnded;
    }
    if (isSoldOut) {
      return AddToCartErrorState.soldOut;
    }
    if (isBackorder) {
      return AddToCartErrorState.backorder;
    }
    if (isLowQuantity) {
      return AddToCartErrorState.lowQuantity;
    }

    return AddToCartErrorState.ok;
  }

  renderAddToBagButton() {
    // sale has ended
    // sold out
    // limit reached

    const { cartQuantities } = this.state;

    return (
      <Components.AddToCartButtonWithLimit
        cartQuantities={cartQuantities}
        errorState={this.getErrorState()}
        editable={Reaction.isPreview()}
        onAddToCart={this.handleAddToCart}
        onCartQuantityChange={this.handleCartQuantityChange}
        productVariant={this.props.productVariant}
        productOptions={this.props.productOptions}
      />
    );
  }

  renderGridContent() {
    const content = super.renderGridContent();

    if (!this.hasSale) {
      return content;
    }

    return (
      <div className="grid-content-wrapper">
        {content}

        {this.renderAddToBagButton()}
      </div>
    );
  }
}

function composer(props, onData) {
  let productOptions;

  if (!Reaction.Subscriptions.Sales.ready()) { return; }
  const sale = ReactionSale.selectedSale();

  if (!sale) {
    // continue on without the sale-specific stuff
    return onData(null, {});
  }

  const productsSubscription =
    Meteor.subscribe("AllSaleProducts", sale._id, Reaction.isPreview());

  if (!productsSubscription.ready()) { return; }

  const { product } = props;

  const productVariant = Products.findOne({
    ancestors: product._id,
    type: "variant",
    saleId: sale._id
  });

  if (productVariant) {
    productOptions = Products.find({
      ancestors: productVariant._id,
      type: "variant"
    }).fetch();
  }

  const storedCart = Cart.findOne();

  onData(null, {
    productVariant,
    productOptions,
    sale,
    storedCart
  });
}

replaceComponent("ProductGridItems", SaleProductGridItemsCustomer, [
  composeWithTracker(composer)
]);
