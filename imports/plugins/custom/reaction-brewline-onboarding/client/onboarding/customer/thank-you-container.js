import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { WatchlistItems } from "@brewline/watchlist/lib/collections";

import ThankYou from "./thank-you-component";

const WatchlistName = "Breweries";


function composer(props, onData) {
  let merchantShops;
  let watchlistItems;

  const merchantShopsSubscription = Meteor.subscribe("MerchantShops");
  const watchlistSubscription =
    Meteor.subscribe("WatchlistItems", WatchlistName);

  if (merchantShopsSubscription.ready()) {
    merchantShops = Reaction.getMerchantShops();
  }

  if (watchlistSubscription.ready()) {
    watchlistItems = WatchlistItems.find({}).fetch();
  }

  onData(null, {
    ...props,
    watchlistItems,
    merchantShops
  });
}

registerComponent(
  "OnboardingCustomerThankYou",
  ThankYou,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(ThankYou);
