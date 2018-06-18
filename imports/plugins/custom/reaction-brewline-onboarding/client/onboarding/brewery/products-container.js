import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
// import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import Products from "./products-component";


class ProductsContainer extends Component {
  state = {
    searchResults: null
  };

  fetchSearchResults = (q) => {
    Meteor.call("connectors/untappd/search/products", { q }, (err, res) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      this.setState({ searchResults: res.response.beers.items });
    });
  }

  addProduct = (productId) => {
    Meteor.call("connectors/untappd/import/products", productId, (err, res) => {
      if (err) {
        // TODO: correct wording
        Alerts.toast(err.reason, "error");
      } else {
        // TODO: correct wording
        Alerts.toast("Product Added to Shop. Processing Images...", "success");

        this.props.onNextStep();
      }
    });
  }

  render() {
    return (
      <Products
        {...this.props}
        onSearch={this.fetchSearchResults}
        searchResults={this.state.searchResults || this.props.searchResults}
        onAddProduct={this.addProduct}
      />
    );
  }
}


function composer(props, onData) {
  let searchResults;

  // get brewery beers
  Meteor.call("onboarding/breweryBeerList", (error, searchResults) => {
    if (error) {
      onData(null, {
        ...props,
        beerSearch: true
      });

      return Alerts.toast(error.reason, "error");
    }

    if (searchResults) {
      onData(null, {
        ...props,
        searchResults
      });
    }
  });

  onData(null, props);
}

registerComponent(
  "OnboardingBreweryProducts",
  ProductsContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(ProductsContainer);


