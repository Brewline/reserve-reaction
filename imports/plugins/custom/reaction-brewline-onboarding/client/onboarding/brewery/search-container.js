import { Meteor } from 'meteor/meteor'
import React, { Component } from "react";
import { compose } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import Search from './search-component';

const ACCOUNT_TYPE_BREWERY = "brewery";
const ACCOUNT_TYPE_USER = "user";

class SearchContainer extends Component {
  state = {
    searchResults: []
  };

  addShop = (untappdShopId) => {
    Meteor.call("onboarding/createUntappdShop", untappdShopId, (err, shop) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "danger");
      } else {
        Alerts.toast("Shop created", "success");

        this.props.onNextStep();

        Reaction.setShopId(shop._id);
      }
    });
  }

  fetchSearchResults = (q) => {
    Meteor.call("connectors/untappd/search/shops", { q }, (err, res) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "danger");
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
  const user = Meteor.user();

  if (user && user.account_type === ACCOUNT_TYPE_BREWERY) {
    userBrewery = user.brewery_details;
  }

  onData(null, {
    ...props,
    userBrewery
  });
}

registerComponent(
  "OnboardingBrewerySearch",
  SearchContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(SearchContainer);
