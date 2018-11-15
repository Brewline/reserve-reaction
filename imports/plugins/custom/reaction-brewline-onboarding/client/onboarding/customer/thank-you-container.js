import ReactGA from "react-ga";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { WatchlistItems } from "@brewline/watchlist/lib/collections";

import ThankYou from "./thank-you-component";

const WatchlistName = "Breweries";

class ThankYouContainer extends Component {
  static propTypes = {
    onNextStep: PropTypes.func.isRequired
  };

  state = {
    searchResults: []
  };

  handleRequestSignUp = () => {
    ReactGA.event({
      category: "Auth",
      action: "Customer Onboarding Sign Up"
    });

    this.setState({ shouldShowAuthModal: true });

    // TODO: consider moving this to the main Brewline package.
    // makes sense to do this site-wide
    this.preLoginUserId = Meteor.userId();
    // capture onLoginHandler so we can cancel it later
    this.onLoginHandler = Accounts.onLogin(() => {
      if (this.onLoginHandler && this.onLoginHandler.stop) {
        this.onLoginHandler.stop();
      }

      if (!this.preLoginUserId) { return; }
      if (Meteor.userId() === this.preLoginUserId) { return; }

      Meteor.call("onboarding/transferFavorites", this.preLoginUserId);

      ReactGA.event({
        category: "Auth",
        action: "Customer Onboarding Sign Up Complete"
      });
    });
  }

  handleCancelSignUp = () => {
    this.setState({ shouldShowAuthModal: false });

    // unregister onLogin
    this.preLoginUserId = null;
    if (this.onLoginHandler && this.onLoginHandler.stop) {
      this.onLoginHandler.stop();
    }
  }

  render() {
    return (
      <ThankYou
        {...this.props}
        onCancelSignUp={this.handleCancelSignUp}
        onRequestSignUp={this.handleRequestSignUp}
        shouldShowAuthModal={this.state.shouldShowAuthModal}
      />
    );
  }
}

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

  let loggedInUser;
  if (!Reaction.hasPermission("anonymous")) {
    loggedInUser = Meteor.user();
  }

  onData(null, {
    ...props,
    loggedInUser,
    merchantShops,
    watchlistItems
  });
}

registerComponent(
  "OnboardingCustomerThankYou",
  ThankYouContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(ThankYouContainer);
