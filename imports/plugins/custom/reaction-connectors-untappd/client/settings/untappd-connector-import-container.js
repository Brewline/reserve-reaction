import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Products } from "/lib/collections";
import { default as ReactionAlerts } from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";

import "./connect-with";
import UntappdConnectorImport from "./untappd-connector-import-component";

class UntappdConnectorImportContainer extends Component {
  constructor(props) {
    super(props);

    this.fetchAccessToken = this.fetchAccessToken.bind(this);
    this.fetchSearchResults = this.fetchSearchResults.bind(this);

    // // initial state
    const alertId = "connectors-untappd-search";

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
    Meteor.call("connectors/untappd/search/products", { q }, (err, res) => {
      if (err) {
        // TODO: correct wording
        return ReactionAlerts.add(
          err.reason,
          "danger",
          Object.assign({}, this.state.alertOptions, {
            i18nKey: "admin.settings.createGroupError"
          })
        );
      }

      this.setState({ searchResults: res.response.beers.items });
    });
  }

  render() {
    return (
      <UntappdConnectorImport
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
  "UntappdConnectorImport",
  UntappdConnectorImportContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(UntappdConnectorImportContainer);
