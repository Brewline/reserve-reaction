import _ from "lodash";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { compose } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import Search from "./search-component";

const ACCOUNT_TYPE_BREWERY = "brewery";
const ACCOUNT_TYPE_USER = "user";

class SearchContainer extends Component {
  state = {
    searchResults: []
  };

  getShopName(untappdShopId, defaultValue) {
    if (!_.get(this.state, "searchResults.length")) {
      return defaultValue;
    }

    const brewery = _.find(
      this.state.searchResults,
      (r) => _.get(r, "brewery.brewery_id") === untappdShopId
    );

    if (!brewery) { return defaultValue; }

    return brewery.brewery_name || defaultValue;
  }

  addShop = (untappdShopId) => {
    const msg = `Importing ${this.getShopName(untappdShopId, "your shop")}`;
    Alerts.toast(msg, "info");
    Meteor.call("onboarding/createUntappdShop", untappdShopId, (err, shop) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      Alerts.toast("Shop created", "success");

      Reaction.setShopId(shop._id);

      this.props.onNextStep();
    });
  }

  fetchSearchResults = (q) => {
    Meteor.call("connectors/untappd/search/shops", { q }, (err, res) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      this.setState({ searchResults: res.response.brewery.items });
    });
  }

  render() {
    return (
      <Search
        {...this.props}
        onSearch={this.fetchSearchResults}
        searchResults={this.state.searchResults}
        onAddShop={this.addShop}
      />
    );
  }
}

function composer(props, onData) {
  let userBrewery;
  let currentBrewery;
  const user = Meteor.user();
  const shopSubscription = Meteor.subscribe("PrimaryShop");

  if (shopSubscription.ready()) {
    const shop = Reaction.getShop();

    if (shop.UntappdId) {
      currentBrewery = shop;
    }
  }

  if (user && user.account_type === ACCOUNT_TYPE_BREWERY) {
    userBrewery = user.brewery_details;
  }

  if (userBrewery || currentBrewery) {
    onData(null, {
      ...props,
      userBrewery,
      currentBrewery
    });
  } else {
    // avoid a re-paint by passing the original instance of props... maybe?
    onData(null, props);
  }
}

registerComponent(
  "OnboardingBrewerySearch",
  SearchContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(SearchContainer);
