import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { Reaction } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Shops, Accounts } from "/lib/collections";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import CurrencyDropdown from "../components/currencyDropdown";

const handlers = {
  handleChange(value) {
    const currency = value.split(" ");
    const currencyName = currency[0];
    // update Accounts with the selected currency
    Meteor.call("accounts/setProfileCurrency", currencyName);

    const { cart, token } = getCart();
    if (!cart) return;

    // Attach changed currency to this users cart
    Meteor.call("cart/setUserCurrency", cart._id, token, currencyName);
  }
};

const composer = (props, onData) => {
  let currentCurrency = "USD $";
  const currencies = [];

  if (Reaction.Subscriptions.PrimaryShop.ready() && Reaction.Subscriptions.MerchantShops.ready() && Meteor.user()) {
    let shopId;

    // Choose shop to get language from
    if (Reaction.marketplaceEnabled && Reaction.merchantCurrency) {
      shopId = Reaction.getShopId();
    } else {
      shopId = Reaction.getPrimaryShopId();
    }

    const shop = Shops.findOne(shopId, {
      fields: {
        currencies: 1,
        currency: 1
      }
    });

    const user = Accounts.findOne({
      _id: Reaction.getUserId()
    });
    const profileCurrency = user && user.profile && user.profile.currency;

    if (Match.test(shop, Object) && shop.currency) {
      const locale = Reaction.Locale.get();

      if (profileCurrency && shop.currencies[profileCurrency] && shop.currencies[profileCurrency].symbol) {
        currentCurrency = `${profileCurrency} ${shop.currencies[profileCurrency].symbol}`;
      } else if (locale && locale.currency && locale.currency.enabled) {
        currentCurrency = `${locale.locale.currency.split(",")[0]} ${locale.currency.symbol}`;
      } else {
        currentCurrency = `${shop.currency.split(",")[0]} ${shop.currencies[shop.currency].symbol}`;
      }
    }

    if (Match.test(shop, Object) && shop.currencies) {
      for (const currencyName in shop.currencies) {
        if (shop.currencies[currencyName].enabled === true) {
          const currency = { currency: currencyName };
          // only one currency will be "active". Either the one
          // matching the profileCurrency if it exists or else
          //  the one matching shop currency
          if (profileCurrency) {
            if (profileCurrency === currency.currency) {
              currency.class = "active";
            }
          } else if (shop.currency === currency.currency) {
            currency.class = "active";
          }
          currency.symbol = shop.currencies[currencyName].symbol;
          currencies.push(currency);
        }
      }
    }
  }

  onData(null, { currentCurrency, currencies });
};

registerComponent("CurrencyDropdown", CurrencyDropdown, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(CurrencyDropdown);
