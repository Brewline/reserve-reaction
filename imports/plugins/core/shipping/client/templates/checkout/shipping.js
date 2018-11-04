import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { EJSON } from "meteor/ejson";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Reaction } from "/client/api";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "/client/modules/logger";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

// Because we are duplicating shipment quotes across shipping records
// we will get duplicate shipping quotes but we only want to diplay one
// So this function eliminates duplicates
/**
 * Return a unique list of objects
 * @param {Array} objs - An array of objects
 * @returns {Array} An array of object only containing unique members
 * @private
 */
function uniqObjects(objs) {
  const jsonBlobs = objs.map((obj) => JSON.stringify(obj));
  const uniqueBlobs = _.uniq(jsonBlobs);
  return uniqueBlobs.map((blob) => EJSON.parse(blob));
}

/**
 * @name cartShippingQuotes
 * @summary returns a list of all the shipping costs/quotations of each available shipping carrier like UPS, Fedex etc.
 * @returns {Array} - an array of the quotations of multiple shipping carriers.
 * @private
 */
function cartShippingQuotes() {
  const { cart } = getCart();
  const shipmentQuotes = [];
  if (cart && cart.shipping) {
    for (const shipping of cart.shipping) {
      if (shipping.shipmentQuotes) {
        for (const quote of shipping.shipmentQuotes) {
          shipmentQuotes.push(quote);
        }
      }
    }
  }

  return uniqObjects(shipmentQuotes);
}

function shippingMethodsQueryStatus() {
  const { cart } = getCart();
  let queryStatus;
  let failingShippingProvider;

  if (cart && cart.shipping) {
    for (const shipping of cart.shipping) {
      const quotesQueryStatus = shipping.shipmentQuotesQueryStatus;
      if (quotesQueryStatus) {
        queryStatus = quotesQueryStatus.requestStatus;
      }
      if (queryStatus === "error") {
        failingShippingProvider = quotesQueryStatus.shippingProvider;
      }
    }
  }

  return [queryStatus, failingShippingProvider];
}

function enabledShipping() {
  const enabledShippingArr = [];
  const apps = Reaction.Apps({
    provides: "shippingSettings",
    enabled: true,
    shopId: Reaction.getPrimaryShopId()
  });
  for (const app of apps) {
    if (app.enabled === true) enabledShippingArr.push(app);
  }
  return enabledShippingArr;
}

Template.coreCheckoutShipping.onCreated(function () {
  this.subscribe("Shipping");

  this.autorun(() => {
    if (!this.subscriptionsReady()) return;

    const isLoadingShippingMethods = shippingMethodsQueryStatus()[0] === "pending";
    this.state.set("isLoadingShippingMethods", isLoadingShippingMethods);
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isLoadingShippingMethods: true
  });
});

Template.coreCheckoutShipping.helpers({
  // retrieves current rates and updates shipping rates
  // in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentQuotes() {
    const instance = Template.instance();
    if (!instance.subscriptionsReady()) return [];

    return cartShippingQuotes();
  },

  hasShippingMethods() {
    const instance = Template.instance();
    const isLoadingShippingMethods = instance.state.get("isLoadingShippingMethods");
    if (isLoadingShippingMethods) {
      return true;
    }

    // Useful for when shipping methods are enabled, but querying them fails
    // due to internet connection issues.
    const quotesQueryStatus = shippingMethodsQueryStatus();
    const didAllQueriesFail = quotesQueryStatus[0] === "error" && quotesQueryStatus[1] === "all";
    if (didAllQueriesFail) {
      Logger.warn("All shipping method queries failed!");
      return false;
    }

    return enabledShipping().length > 0;
  },

  // helper to display currently selected fulfillment option
  isSelected() {
    if (!this.method) return null;

    const { cart } = getCart();
    if (!cart) return null;

    const match = (cart.shipping || []).find((group) => group.shipmentMethod && group.shipmentMethod._id === this.method._id);
    if (match) return "active";

    return null;
  },

  isReady() {
    return Template.instance().subscriptionsReady() && Reaction.Subscriptions.Cart.ready();
  },

  /**
   * Template helper that checks to see if the user has permissions for the shop
   * responsible for shipping rates. This is the primary shop unless
   * `merchantShippingRates` is enabled in marketplace
   * @method isAdmin
   * @return {Boolean} true if the user has admin access, otherwise false
   * @ignore
   */
  isAdmin() {
    const marketplaceSettings = Reaction.marketplace;
    if (marketplaceSettings && marketplaceSettings.merchantShippingRates) {
      Reaction.hasAdminAccess();
    }
    return Reaction.hasAdminAccess(Reaction.getPrimaryShopId());
  }
});

//
// Set and store cart shipmentMethod
// this copies from shipmentMethods (retrieved rates)
// to shipmentMethod (selected rate)
//
Template.coreCheckoutShipping.events({
  "click .list-group-item"(event) {
    event.preventDefault();
    event.stopPropagation();
    const { cart, token } = getCart();

    Meteor.call("cart/setShipmentMethod", cart._id, token, this.method._id, (error) => {
      if (error) throw new ReactionError("set-shipment-method-error", error.message);
    });
  },
  "click [data-event-action=configure-shipping]"(event) {
    event.preventDefault();

    const dashboardRegistryEntry = Reaction.Apps({ name: "reaction-dashboard", provides: "shortcut" });
    const shippingRegistryEntry = Reaction.Apps({ name: "reaction-shipping", provides: "settings" });

    Reaction.showActionView([
      dashboardRegistryEntry[0],
      shippingRegistryEntry[0]
    ]);
  }
});
