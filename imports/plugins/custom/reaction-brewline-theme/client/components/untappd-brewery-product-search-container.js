import _ from "lodash";
import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactGA from "react-ga";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
// import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import UntappdBreweryProductsSearch, { DEFAULT_SORT } from "./untappd-brewery-product-search-component";

const wrapComponent = (Comp) => (
  class ProductsContainer extends Component {
    static propTypes = {
      onClickProduct: PropTypes.func.isRequired,
      searchResults: PropTypes.arrayOf(PropTypes.object),
      shop: PropTypes.object
    };

    state = {
      searchResults: null
    };

    get shop() {
      return this.props.shop || {};
    }

    get searchResults() {
      const { searchResults: providedSearchResults } = this.props;
      const { searchResults: generatedSearchResults } = this.state;

      return generatedSearchResults || providedSearchResults;
    }

    getProduct(untappdShopId) {
      const { searchResults = {} } = this.state;

      const brewery = _.find(
        searchResults,
        (r) => _.get(r, "beer.bid") === untappdShopId
      );

      return brewery || {};
    }

    // latest: -created_at
    fetchSearchResults = (q, sort) => {
      const { UntappdId: brewery_id } = this.shop; // eslint-disable-line camelcase
      const filters = { q, brewery_id }; // eslint-disable-line camelcase

      if (sort) {
        filters.sort = sort;
      }

      // TODO: move the server method
      Meteor.call("connectors/untappd/search/products", filters, (err, res) => {
        if (err) {
          // TODO: correct wording
          return Alerts.toast(err.reason, "error");
        }

        this.setState({ searchResults: _.get(res, "response.beers.items", []) });

        ReactGA.event({
          category: "Search",
          action: "Brewery Beer Search",
          label: q
        });
      });
    }

    handleClearSearch = () => {
      this.setState({ searchResults: null });
    }

    render() {
      return (
        <Comp
          {...this.props}
          onSearch={this.fetchSearchResults}
          onClearSearch={this.handleClearSearch}
          searchResults={this.searchResults}
        />
      );
    }
  }
);


function composer(props, onData) {
  // get brewery beers
  // TODO: move onboarding/breweryBeerList to untappd plugin
  Meteor.call("onboarding/breweryBeerList", { sort: DEFAULT_SORT }, (error, searchResults) => {
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

  onData(null, props);
}

registerComponent(
  "UntappdBreweryProductsSearch",
  UntappdBreweryProductsSearch,
  [
    composeWithTracker(composer),
    wrapComponent
  ]
);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(UntappdBreweryProductsSearch);
