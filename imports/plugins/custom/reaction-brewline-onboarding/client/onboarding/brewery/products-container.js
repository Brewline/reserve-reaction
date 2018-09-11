import _ from "lodash";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactGA from "react-ga";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
// import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import Products from "./products-component";


class ProductsContainer extends Component {
  propTypes = {
    onNextStep: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.object)
  };

  state = {
    searchResults: []
  };

  getProduct(untappdShopId) {
    let searchResults;

    const { searchResults: propsResults } = this.props;
    const { searchResults: stateResults } = this.state;

    if (propsResults && propsResults.length) {
      searchResults = propsResults;
    } else if (stateResults && stateResults.length) {
      searchResults = stateResults;
    } else {
      return {};
    }

    const brewery = _.find(
      searchResults,
      (r) => _.get(r, "beer.bid") === untappdShopId
    );

    return brewery || {};
  }

  fetchSearchResults = (q) => {
    Meteor.call("connectors/untappd/search/products", { q }, (err, res) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      this.setState({ searchResults: res.response.beers.items });

      ReactGA.event({
        category: "Search",
        action: "Beer Search",
        label: q
      });
    });
  }

  addProduct = (productId) => {
    const untappdProduct = this.getProduct(productId);
    const { beer = {} } = untappdProduct;
    const displayName = beer.beer_name || "???";

    Meteor.call("connectors/untappd/import/products", productId, (err, _res) => {
      if (err) {
        // TODO: correct wording
        Alerts.toast(err.reason, "error");
      } else {
        // TODO: correct wording
        Alerts.toast("Product Added to Shop. Processing Images...", "success");

        this.props.onNextStep();

        ReactGA.event({
          category: "Resources",
          action: "Create Product",
          label: displayName
        });
      }
    });
  }

  render() {
    let { searchResults } = this.state;

    if (!searchResults || !searchResults.length) {
      ({ searchResults } = this.props);
    }

    return (
      <Products
        {...this.props}
        onSearch={this.fetchSearchResults}
        searchResults={searchResults}
        onAddProduct={this.addProduct}
      />
    );
  }
}


function composer(props, onData) {
  // get brewery beers
  // TODO: move onboarding/breweryBeerList to untappd plugin
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


