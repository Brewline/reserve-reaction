import _ from "lodash";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";

import { WatchlistItems } from "@brewline/watchlist/lib/collections";
import Search from "./search-component";

class SearchContainer extends Component {
  static propTypes = {
    onNextStep: PropTypes.func.isRequired
  };

  static WatchlistName = "Breweries";

  state = {
    searchResults: []
  };

  // some day
  // ref = React.createRef();

  getShop(untappdShopId) {
    if (!_.get(this.state, "searchResults.length")) { return {}; }

    const brewery = _.find(
      this.state.searchResults,
      (r) => _.get(r, "brewery.brewery_id") === untappdShopId
    );

    return brewery || {};
  }

  addFavorite = (untappdShopId) => {
    const untappdShop = this.getShop(untappdShopId);
    const { brewery } = untappdShop;
    const displayName = brewery.brewery_name;

    const msg = `Adding ${displayName || "this shop"} to your favorite...`;
    Alerts.toast(msg, "info");
    Meteor.call("onboarding/addUntappdShopToWaitlist", untappdShopId, (err, _watchlistItem) => {
      if (err) {
        // TODO: correct wording
        // return Alerts.toast(err.reason, "error");
        return Alerts.toast("Oops... something went wrong. try again later, maybe?", "error");
      }

      this.requestBreweryContactInfo(brewery);
    });
  }

  requestBreweryContactInfo(brewery) {
    const breweryName = brewery.brewery_name;

    const options = {
      type: "success",
      showCancelButton: true,
      showCloseButton: true,
      cancelButtonText: "Add more",
      confirmButtonText: "Make an introduction"
    };
    const title = "Favorite added";
    const content = `
      Do you know anyone at ${breweryName}?
      We would love an introduction!
    `;

    return Alerts.alert(title, content, options, (isConfirm) => {
      if (!isConfirm) { return; }

      window.open("https://www.brewline.io/contact/", "_blank");
    }).then((val) => {
      this.clearSearchResults();
      this.inputRef.value = "";
      this.inputRef.focus();
      return val;
    });
  }

  fetchSearchResults = (q) => {
    Meteor.call("connectors/untappd/search/shops", { q }, (err, res) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      this.setState({ searchResults: _.get(res, "response.brewery.items", []) });
    });
  }

  clearSearchResults() {
    this.setState({ searchResults: [] });
  }

  render() {
    return (
      <Search
        {...this.props}
        onSearch={this.fetchSearchResults}
        onAddShop={this.addFavorite}
        inputRef={(ref) => { this.inputRef = ref; }}
        searchResults={this.state.searchResults}
      />
    );
  }
}

function composer(props, onData) {
  let watchlistItems;
  const watchlistSubscription =
    Meteor.subscribe("WatchlistItems", SearchContainer.WatchlistName);

  if (watchlistSubscription.ready()) {
    watchlistItems = WatchlistItems.find({}).fetch();
  }

  if (watchlistItems !== undefined) {
    onData(null, {
      ...props,
      watchlistItems
    });
  }
}

registerComponent(
  "OnboardingCustomerSearch",
  SearchContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(SearchContainer);
