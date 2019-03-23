import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { StyleRoot } from "radium";
import { compose } from "recompose";
import { withRouter } from "react-router";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Meteor } from "meteor/meteor";
import { Catalog, ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Shops, Tags } from "/lib/collections";
import { ProductDetail } from "../components";
import { SocialContainer, VariantListContainer } from "./";
import { Media } from "/imports/plugins/core/files/client";
import { getAnonymousCartsReactive, storeAnonymousCart } from "/imports/plugins/core/cart/client/util/anonymousCarts";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

const wrapComponent = (Comp) =>
  class ProductDetailContainer extends Component {
    static propTypes = {
      media: PropTypes.arrayOf(PropTypes.object),
      product: PropTypes.object,
      storedCart: PropTypes.object
    };

    constructor(props) {
      super(props);

      this.animationTimeOut = null;
      this.textTimeOut = null;

      this.state = {
        cartQuantity: 1,
        productClick: 0
      };
    }

    componentDidMount() {
      this._isMounted = true;
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    handleCartQuantityChange = (event, quantity) => {
      this.setState({
        cartQuantity: Math.max(quantity, 1)
      });
    };

    handleAddToCart = () => {
      let productId;
      let quantity;
      let maxQuantity;
      let totalQuantity;
      let storedQuantity = 0;
      const currentVariant = ReactionProduct.selectedVariant();
      const currentProduct = ReactionProduct.selectedProduct();

      if (currentVariant) {
        if (currentVariant.ancestors.length === 1) {
          const options = ReactionProduct.getVariants(currentVariant._id);

          if (options.length > 0) {
            Alerts.inline("Please choose options before adding to cart", "warning", {
              placement: "productDetail",
              i18nKey: "productDetail.chooseOptions",
              autoHide: 10000
            });
            return [];
          }
        }

        if (currentVariant.inventoryPolicy && currentVariant.inventoryInStock < 1) {
          Alerts.inline("Sorry, this item is out of stock!", "warning", {
            placement: "productDetail",
            i18nKey: "productDetail.outOfStock",
            autoHide: 10000
          });
          return [];
        }

        if (this.props.storedCart && this.props.storedCart.items) {
          this.props.storedCart.items.forEach((item) => {
            if (item.variantId === currentVariant._id) {
              storedQuantity = item.quantity;
            }
          });
        }

        quantity = parseInt(this.state.cartQuantity, 10);
        totalQuantity = quantity + storedQuantity;
        maxQuantity = currentVariant.inventoryInStock;

        if (quantity < 1) {
          quantity = 1;
        }

        if (currentVariant.inventoryPolicy && quantity > maxQuantity && storedQuantity < maxQuantity) {
          Alerts.inline("Your product quantity has been adjusted to the max quantity in stock", "warning", {
            placement: "productDetail",
            i18nKey: "admin.inventoryAlerts.adjustedQuantity",
            autoHide: 10000
          });
          quantity = maxQuantity - storedQuantity;
          totalQuantity = maxQuantity;
        }

        if (
          currentVariant.inventoryPolicy &&
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

        if (currentVariant.inventoryPolicy && totalQuantity > maxQuantity) {
          Alerts.inline("Sorry, this item is out of stock!", "error", {
            placement: "productDetail",
            i18nKey: "productDetail.outOfStock",
            autoHide: 10000
          });
          return [];
        }

        if (!currentProduct.isVisible) {
          Alerts.inline("Publish product before adding to cart.", "error", {
            placement: "productDetail",
            i18nKey: "productDetail.publishFirst",
            autoHide: 10000
          });
        } else {
          productId = currentProduct._id;

          const onAddToCartSuccess = () => {
            // Reset cart quantity on success
            this.handleCartQuantityChange(null, 1);

            this.setState(({ productClick }) => ({
              productClick: productClick + 1
            }));

            // slide out label
            const addToCartText = i18next.t("productDetail.addedToCart");
            const addToCartTitle = currentVariant.title || "";
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

          if (productId) {
            const shop = Shops.findOne(Reaction.getPrimaryShopId());
            const shopCurrency = (shop && shop.currency) || "USD";

            const items = [{
              price: {
                amount: currentVariant.price,
                currencyCode: shopCurrency
              },
              productConfiguration: {
                productId,
                productVariantId: currentVariant._id
              },
              quantity: quantity || 1
            }];

            const { cart } = getCart();
            if (cart) {
              const storedCarts = getAnonymousCartsReactive();
              let token = null;
              if (storedCarts && storedCarts.length) {
                token = storedCarts[0].token; // eslint-disable-line prefer-destructuring
              }
              Meteor.call("cart/addToCart", cart._id, token, items, (error) => {
                if (error) {
                  Logger.error(error);
                  Alerts.toast(error.message, "error");
                  return;
                }

                onAddToCartSuccess();
              });
            } else {
              Meteor.call("cart/createCart", items, (error, result) => {
                if (error) {
                  Logger.error(error);
                  Alerts.toast(error.message, "error");
                  return;
                }

                const {
                  cart: createdCart,
                  incorrectPriceFailures,
                  minOrderQuantityFailures,
                  token
                } = result;

                if (incorrectPriceFailures.length) {
                  Logger.info("incorrectPriceFailures", incorrectPriceFailures);
                  Alerts.toast("Prices have changed. Please refresh the page.", "error");
                } else if (minOrderQuantityFailures.length) {
                  Logger.info("minOrderQuantityFailures", minOrderQuantityFailures);
                  Alerts.toast(`You must order at least ${minOrderQuantityFailures[0].minOrderQuantity} of this item`, "error");
                }

                if (createdCart) {
                  if (token) {
                    storeAnonymousCart({ _id: createdCart._id, shopId: shop && shop._id, token });
                  }
                  onAddToCartSuccess();
                }
              });
            }
          }

          ReactionProduct.setCurrentVariant(null);

          // scroll to top on cart add
          $("html,body").animate(
            {
              scrollTop: 0
            },
            0
          );
        }
      } else {
        Alerts.inline("Select an option before adding to cart", "warning", {
          placement: "productDetail",
          i18nKey: "productDetail.selectOption",
          autoHide: 8000
        });
      }

      return null;
    };

    handleSlideOut(alertWidth, direction, oppositeDirection) {
      // Animate slide out
      return $(".cart-alert")
        .show()
        .css({
          [oppositeDirection]: "auto",
          [direction]: -alertWidth
        })
        .animate(
          {
            [oppositeDirection]: "auto",
            [direction]: 0
          },
          600
        );
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

    handleProductFieldChange = (productId, fieldName, value) => {
      Meteor.call("products/updateProductField", productId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        }
      });
    };

    handleDeleteProduct = () => {
      ReactionProduct.archiveProduct(this.props.product);
    };

    render() {
      const { media, product } = this.props;

      if (_.isEmpty(product)) {
        return <Components.ProductNotFound />;
      }

      return (
        <StyleRoot>
          <Comp
            cartQuantity={this.state.cartQuantity}
            mediaGalleryComponent={<Components.MediaGallery media={media} />}
            onAddToCart={this.handleAddToCart}
            onCartQuantityChange={this.handleCartQuantityChange}
            socialComponent={<SocialContainer />}
            topVariantComponent={<VariantListContainer />}
            onDeleteProduct={this.handleDeleteProduct}
            onProductFieldChange={this.handleProductFieldChange}
            {...this.props}
          />
        </StyleRoot>
      );
    }
  };

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const tagSub = Meteor.subscribe("Tags");
  const shopIdOrSlug = Reaction.Router.getParam("shopSlug");
  const productId = props.match.params.handle;
  const variantId = ReactionProduct.selectedVariantId();
  const revisionType = Reaction.Router.getQueryParam("revision");

  let productSub;
  if (productId) {
    productSub = Meteor.subscribe("Product", productId, shopIdOrSlug);
  }
  if (productSub && productSub.ready() && tagSub.ready() && Reaction.Subscriptions.Cart && Reaction.Subscriptions.Cart.ready()) {
    const product = ReactionProduct.setProduct(productId, variantId);
    if (Reaction.hasPermission("createProduct")) {
      if (!Reaction.getActionView() && Reaction.isActionViewOpen() === true) {
        Reaction.setActionView({
          template: "productAdmin",
          data: product
        });
      }
    }

    // Get the product tags
    if (product) {
      let tags;
      const hashTags = product.hashtags || product.tagIds;
      if (_.isArray(hashTags)) {
        tags = Tags.find({ _id: { $in: hashTags } }).fetch();
      }

      Meteor.subscribe("ProductMedia", product._id);

      let mediaArray = [];
      const selectedVariant = ReactionProduct.selectedVariant();

      if (selectedVariant) {
        // Find the media for the selected variant
        mediaArray = Media.findLocal(
          {
            "metadata.variantId": selectedVariant._id
          },
          {
            sort: {
              "metadata.priority": 1
            }
          }
        );

        // If no media found, broaden the search to include other media from parents
        if (Array.isArray(mediaArray) && mediaArray.length === 0 && selectedVariant.ancestors) {
          // Loop through ancestors in reverse to find a variant that has media to use
          for (const ancestor of selectedVariant.ancestors.reverse()) {
            const media = Media.findLocal(
              {
                "metadata.variantId": ancestor
              },
              {
                sort: {
                  "metadata.priority": 1
                }
              }
            );

            // If we found some media, then stop here
            if (Array.isArray(media) && media.length) {
              mediaArray = media;
              break;
            }
          }
        }
      }

      let priceRange;
      if (selectedVariant && typeof selectedVariant === "object") {
        const childVariants = ReactionProduct.getVariants(selectedVariant._id);
        // when top variant has no child variants we display only its price
        if (childVariants.length === 0) {
          priceRange = selectedVariant.price;
        } else {
          // otherwise we want to show child variants price range
          priceRange = Catalog.getVariantPriceRange(selectedVariant._id);
        }
      }

      let productRevision;

      if (revisionType === "published") {
        productRevision = product.__published;
      }

      const editable = Reaction.hasPermission(["createProduct"]);

      const topVariants = ReactionProduct.getTopVariants();

      const { cart: storedCart } = getCart();

      onData(null, {
        variants: topVariants,
        layout: product.template || "productDetailSimple",
        product: productRevision || product,
        priceRange,
        tags,
        media: mediaArray,
        editable,
        hasAdminPermission: Reaction.hasPermission(["createProduct"]),
        storedCart
      });
    } else {
      // onData must be called with composeWithTracker, or else the loading icon will show forever.
      onData(null, {});
    }
  }
}

registerComponent("ProductDetail", ProductDetail, [withRouter, composeWithTracker(composer), wrapComponent]);

// Decorate component and export
export default compose(withRouter, composeWithTracker(composer), wrapComponent)(ProductDetail);
