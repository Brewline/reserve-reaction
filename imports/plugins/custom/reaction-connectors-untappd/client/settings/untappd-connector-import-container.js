import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

import "./connect-with";
import UntappdConnectorImport from "./untappd-connector-import-component";

class UntappdConnectorImportContainer extends Component {
  static propTypes = UntappdConnectorImport.propTypes;

  state = {};

  fetchSearchResults = (q) => {
    Meteor.call("connectors/untappd/search/products", { q }, (err, res) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      this.setState({ searchResults: res.response.beers.items });
    });
  }

  render() {
    return (
      <UntappdConnectorImport
        {...this.props}
        onSearch={this.fetchSearchResults}
        searchResults={this.state.searchResults || this.props.searchResults}
      />
    );
  }
}

function composer(props, onData) {
  const shop = Reaction.getShop();
  const { UntappdId: untappdId } = shop;

  if (!untappdId) { return; }

  Meteor.call("onboarding/breweryBeerList", (error, searchResults) => {
    if (error) {
      return Alerts.toast(error.reason, "error");
    }

    if (searchResults) {
      onData(null, {
        ...props,
        searchResults
      });
    }
  });
}

registerComponent(
  "UntappdConnectorImport",
  UntappdConnectorImportContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(UntappdConnectorImportContainer);
