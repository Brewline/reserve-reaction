import _ from "lodash";
import slugify from "slugify";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactGA from "react-ga";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { ReactionSale } from "@reaction/sale";
import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import Products from "./products-component";

class ProductsContainer extends Component {
  static propTypes = {
    onNextStep: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.object)
  };

  constructor(props) {
    super(props);

    Reaction.getSlug(); // trigger lazy loading of slugify package
  }

  state = {
    searchResults: []
  };

  getProduct(untappdProductId) {
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
      (r) => _.get(r, "beer.bid") === untappdProductId
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

  addProduct = (untappdProductId) => {
    const untappdProduct = this.getProduct(untappdProductId);
    const { beer = {} } = untappdProduct;
    const displayName = beer.beer_name || "???";
    const thisFriday = getUpcomingFriday();

    const headline = `${displayName} Can Release`;
    // const slug = await Reaction.getSlug(headline);
    const slug = slugify(headline.toLowerCase());
    const saleData = {
      slug,
      headline,
      beginsAt: thisFriday,
      endsAt: new Date(thisFriday.getTime() + 2 * 86400000 - 60000), // 11:59 pm
      isDemo: false,
      isVisible: false
    };
    const optionData = {
      title: "4 Pack (16oz. cans)",
      price: 14.99,
      inventoryQuantity: 300,
      inventoryLimit: 6
    };

    // create can release
    // add product
    Meteor.call("Sales/insert", saleData, (err, saleId) => {
      if (err) {
        Alerts.toast(err.reason, "error");
        return;
      }
      // TODO: i18n
      Alerts.toast("(1 of 3) Created Can Release...", "success");

      // set current sale
      ReactionSale.setSale(saleId);

      Meteor.call("Sales/importUntappdProduct", saleId, untappdProductId, [optionData], (productErr, res) => {
        if (productErr || !res) {
          // TODO: correct wording
          if (productErr && productErr.reason) {
            Alerts.toast(productErr.reason, "error");
          }

          return Alerts.toast("Failed to import product from Untappd", "error");
        }

        Alerts.toast(`(2 of 3) Successfully added ${displayName}.`, "success");
        Alerts.toast("(3 of 3) Importing images (this can take a few minutes)", "info");

        ReactGA.event({
          category: "Can Releases",
          action: "Add Product (Onboarding)",
          label: displayName
        });
      });

      this.props.onNextStep();

      ReactGA.event({
        category: "Can Releases",
        action: "Create Sale (Onboarding)",
        label: displayName
      });
    });

    // Meteor.call("connectors/untappd/import/products", untappdProductId, (err, _res) => {
    //   if (err) {
    //     // TODO: correct wording
    //     Alerts.toast(err.reason, "error");
    //   } else {
    //     // TODO: correct wording
    //     Alerts.toast("Product Added to Shop. Processing Images...", "success");

    //     this.props.onNextStep();

    //     ReactGA.event({
    //       category: "Resources",
    //       action: "Create Product",
    //       label: displayName
    //     });
    //   }
    // });
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
  Meteor.call("onboarding/breweryBeerList", undefined, { sort: "-created_at" }, (error, searchResults) => {
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

function getUpcomingFriday() {
  const now = new Date();

  now.setDate(now.getDate() + 1); // make it tomorrow in case today is a Friday
  now.setHours(0, 0, 0, 0); // pro-tip: setHours allows minutes, seconds, & ms
  const daysTillFriday = (12 - now.getDay()) % 7;
  now.setDate(now.getDate() + daysTillFriday);

  return now;
}

registerComponent(
  "OnboardingBreweryProducts",
  ProductsContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(ProductsContainer);
