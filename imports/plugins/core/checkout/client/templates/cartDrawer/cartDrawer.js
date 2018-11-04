import { Components } from "@reactioncommerce/reaction-components";
import Logger from "@reactioncommerce/logger";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

/**
 * cartDrawer helpers
 *
 * @provides displayCartDrawer
 * @returns  open or closed cart drawer template
 */

Template.cartDrawer.helpers({
  displayCartDrawer() {
    if (!Session.equals("displayCart", true)) {
      return null;
    }

    const { cart } = getCart();
    let count = 0;

    if (cart && cart.items) {
      for (const items of cart.items) {
        count += items.quantity;
      }
    }

    if (count === 0) {
      return Template.emptyCartDrawer;
    }
    return Template.openCartDrawer;
  }
});

/**
 * openCartDrawer helpers
 *
 */
Template.openCartDrawer.onRendered(() => {
  /**
   * Add swiper to openCartDrawer
   *
   */

  let swiper;
  document.querySelector("#cart-drawer-container").classList.add("opened");
  if (!swiper) {
    import("swiper")
      .then((module) => {
        const Swiper = module.default;
        swiper = new Swiper(".cart-drawer-swiper-container", {
          direction: "horizontal",
          setWrapperSize: true,
          loop: false,
          grabCursor: true,
          slidesPerView: "auto",
          wrapperClass: "cart-drawer-swiper-wrapper",
          slideClass: "cart-drawer-swiper-slide",
          slideActiveClass: "cart-drawer-swiper-slide-active",
          pagination: ".cart-drawer-pagination",
          paginationClickable: true
        });
        return swiper;
      })
      .catch((error) => {
        Logger.error(error.message, "Unable to load Swiper module");
      });
  }
});

Template.openCartDrawer.helpers({
  CartDrawerContainer() {
    return Components.CartDrawer;
  }
});

Template.emptyCartDrawer.onRendered(() => document.querySelector("#cart-drawer-container").classList.add("opened"));

Template.emptyCartDrawer.helpers({
  EmptyCartDrawer() {
    return Components.EmptyCartDrawer;
  }
});
