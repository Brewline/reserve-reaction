import React, { Component } from "react";
import { StyleRoot } from "radium";

import ProductDetailContainer from "/imports/plugins/included/product-detail-simple/client/containers/productDetail";
import { SocialContainer, VariantListContainer } from "/imports/plugins/included/product-detail-simple/client/containers";
import { ProductDetail } from "/imports/plugins/included/product-detail-simple/client/components";
import { DragDropProvider, TranslationProvider } from "/imports/plugins/core/ui/client/providers";

import { compose } from "recompose";
import { Components, getHOCs, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { ReactionProduct } from "/lib/api";

const wrapComponent = (Comp) => (
  class InventoryLimitProductDetailContainer extends ProductDetailContainer {
    constructor(props) {
      super(props);
    }

    testingTesting() {}

    parentHandleAddToCart() {
      ProductDetailContainer.prototype.handleAddToCart.apply(this, arguments);
    }

    handleAddToCart = () => {
      let productId;
      let quantity;
      let maxQuantity;
      let totalQuantity;
      let storedQuantity = 0;
      const currentVariant = ReactionProduct.selectedVariant();
      const currentProduct = ReactionProduct.selectedProduct();

      console.log("Overridden!");

      if (currentVariant) {
        if (currentVariant.ancestors.length === 1) {
          if (options.length > 0) {
            return this.parentHandleAddToCart();
          }
        }

        if (currentVariant.inventoryPolicy && currentVariant.inventoryQuantity < 1) {
          return this.parentHandleAddToCart();
        }

        if (this.props.storedCart && this.props.storedCart.items) {
          this.props.storedCart.items.forEach((item) => {
            if (item.variants._id === currentVariant._id) {
              storedQuantity = item.quantity;
            }
          });
          // storedQuantity = this.props.storedCart.items
          //   .filter((i) => { return i.variants._id === currentVariant._id; })
          //   .reduce((s, i) => { return s + i.quantity }, 0);
        }

        quantity = parseInt(this.state.cartQuantity, 10);
        totalQuantity = quantity + storedQuantity;
        maxQuantity = currentVariant.inventoryQuantity;

        if (quantity < 1) {
          quantity = 1;
        }

        if (currentVariant.inventoryPolicy && quantity > maxQuantity && storedQuantity < maxQuantity) {
          return this.parentHandleAddToCart();
        }

        if (currentVariant.inventoryPolicy && totalQuantity > maxQuantity && storedQuantity < maxQuantity && quantity < maxQuantity) {
          return this.parentHandleAddToCart();
        }

        if (currentVariant.inventoryLimit > 0 && totalQuantity > currentVariant.inventoryLimit && storedQuantity < maxQuantity) {
          Alerts.inline("Your product quantity has been adjusted to the max quantity allowable per order", "warning", {
            placement: "productDetail",
            i18nKey: "admin.inventoryAlerts.adjustedQuantity",
            autoHide: 10000
          });
          quantity = currentVariant.inventoryLimit - storedQuantity;
          totalQuantity = currentVariant.inventoryLimit;
        }
      }

      return this.parentHandleAddToCart();
    }

    render() {
      if (_.isEmpty(this.props.product)) {
        return (
          <Components.ProductNotFound />
        );
      }
      return (
        <TranslationProvider>
          <DragDropProvider>
            <StyleRoot>
              <h1>WTF? WTF? WTF?</h1>
              <Comp
                cartQuantity={this.state.cartQuantity}
                mediaGalleryComponent={<Components.MediaGallery media={this.props.media} />}
                onAddToCart={this.handleAddToCart}
                onCartQuantityChange={this.handleCartQuantityChange}
                onViewContextChange={this.handleViewContextChange}
                socialComponent={<SocialContainer />}
                topVariantComponent={<VariantListContainer />}
                onDeleteProduct={this.handleDeleteProduct}
                onProductFieldChange={this.handleProductFieldChange}
                {...this.props}
              />
            </StyleRoot>
          </DragDropProvider>
        </TranslationProvider>
      );
    }
  }
);

console.log("Replacing Product Detail");
const composeWithTrackerHOC = getHOCs("xxxProductDetail")[0];
registerComponent("ProductDetail", ProductDetail, [
  composeWithTrackerHOC,
  wrapComponent
]);

// Decorate component and export
export default compose(
  composeWithTrackerHOC,
  wrapComponent
)(ProductDetail);
