// TODO: consider combining with untappd-connector-import-container

import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

import "./connect-with";
import UntappdMarketplaceShops from "./untappd-marketplace-shops-component";

class UntappdMarketplaceShopsContainer extends Component {
  constructor(props) {
    super(props);

    this.fetchAccessToken = this.fetchAccessToken.bind(this);
    this.fetchSearchResults = this.fetchSearchResults.bind(this);

    // initial state
    const alertId = "untappd-marketplace-shops-search";

    this.state = {
      alertOptions: {
        placement: alertId,
        id: alertId,
        autoHide: 4000
      },
      searchResults: []
    };
  }

  fetchAccessToken() {
    Meteor.connectWithUntappd(null, function () {
      console.log("Logged In w/Untappd", arguments);
    });
  }

  fetchSearchResults(q) {
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
      <UntappdMarketplaceShops
        {...this.props}
        onGetAccessToken={this.fetchAccessToken}
        onSearch={this.fetchSearchResults}
        searchResults={this.state.searchResults}
      />
    );
  }
}

function composer(props, onData) {
  const socialSettings = {};
  const subscription = Reaction.Subscriptions.Packages;

  if (subscription.ready()) {
    socialSettings.hasAccessToken = true;
    socialSettings.searchTerm = "";
    socialSettings.products = [];
  }

  onData(null, socialSettings);
}

registerComponent(
  "UntappdMarketplaceShops",
  UntappdMarketplaceShopsContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(UntappdMarketplaceShopsContainer);
