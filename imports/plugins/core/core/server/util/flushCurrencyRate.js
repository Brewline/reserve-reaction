import _ from "lodash";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Shops } from "/lib/collections";

/**
 * @name flushCurrencyRate
 * @method
 * @summary Removes exchange rates that are too old. Called by background job
 * @fires Collections.Shops#update
 * @returns {undefined}
 */
export default function flushCurrencyRate() {
  let shopId;
  const marketplaceSettings = Reaction.getMarketplaceSettings();

  if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantLocale) {
    shopId = Reaction.getShopId();
  } else {
    shopId = Reaction.getPrimaryShopId();
  }

  const shop = Shops.findOne(shopId, {
    fields: {
      currencies: 1
    }
  });
  const { updatedAt } = shop.currencies;

  // if updatedAt is not a Date(), then there is no rates yet
  if (typeof updatedAt !== "object") {
    throw new ReactionError(
      "error-occurred",
      "[flushCurrencyRates worker]: There is nothing to flush."
    );
  }

  updatedAt.setHours(updatedAt.getHours() + 48);
  const now = new Date();

  if (now < updatedAt) { // todo remove this line. its for tests
    _.each(shop.currencies, (currencyConfig, currencyKey) => {
      const rate = `currencies.${currencyKey}.rate`;

      if (typeof currencyConfig.rate === "number") {
        Shops.update(shopId, {
          $unset: {
            [rate]: ""
          }
        });
      }
    });
  }
}
