import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

import UntappdConnectorProduct from "@brewline/untappd-connector/client/settings/untappd-connector-product-component";

export default class Products extends Component {
  static propTypes = {
    children: PropTypes.node,
    onAddProduct: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.object)
  };

  renderSearchResult(product, index) {
    // <i className="fa fa-cloud-download"></i>
    return (
      <Components.ListItem
        className="panel-search-results__shop"
        key={index}
      >
        <UntappdConnectorProduct
          product={product}
          onAddProduct={this.props.onAddProduct}
        />
      </Components.ListItem>
    );
  }

  renderSearchResults() {
    if (_.get(this.props, "searchResults.length", 0) <= 0) { return; }

    return (
      <div className="panel-search-results">
        <h4>
          Search Results
        </h4>

        <p>
          Tap the beer you are selling to import it.
        </p>

        <Components.List className="panel-search-results__list">
          {
            this.props.searchResults
              .map((r, i) => this.renderSearchResult(r, i))
          }
        </Components.List>
      </div>
    );
  }

  render() {
    let content;
    const { children } = this.props;

    if (children) {
      content = children;
    } else {
      content = (
        <div>
          <h1>Set up your Beer Release</h1>

          <p>
            Choose the beer you are selling.
            If the beer you wish to release is not in this list, it can be added
            manually later.
          </p>
        </div>
      );
    }

    return (
      <div className="onboarding__step brewline-onboarding__products">
        {content}

        {this.renderSearchResults()}
      </div>
    );
  }
}
