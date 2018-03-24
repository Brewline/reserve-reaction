import _ from "lodash";
import React, { Component } from "react";
import { Components } from "@reactioncommerce/reaction-components";

import UntappdMarketplaceShop from "@brewline/untappd-connector/client/settings/untappd-marketplace-shop-component";

export default class Search extends Component {
  componentWillMount() {
    if (!this.props.userBrewery || !this.props.onNextStep) { return; }

    this.props.onNextStep();
  }

  handleSearch = (e) => {
    e.preventDefault();

    this.props.onSearch(this.qInput.value);

    return false;
  }

  handleSearchThrottled = _.throttle(this.handleSearch, 600);

  renderSearchResult(brewery, index) {
    // <i className="fa fa-cloud-download"></i>
    return (
      <Components.ListItem
        className="panel-search-results__shop"
        key={index}
      >
        <UntappdMarketplaceShop
          brewery={brewery.brewery}
          onAddShop={this.props.onAddShop}
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
          Tap your brewery to create a shop.
        </p>

        <Components.List className="panel-search-results__list">
          {
            this.props.searchResults.map(
              (r, i) => this.renderSearchResult(r, i)
            )
          }
        </Components.List>
      </div>
    );
  }

  render() {
    return (
      <div className="admin-controls-content">
        <h1>Search for your Brewery</h1>

        <p>
          <em>Log in with your Untappd Brewery account to skip this step.</em>
        </p>

        <form onSubmit={this.handleSearch}>
          <div className="form-group" data-required="true">
            <label htmlFor="untappd-search" className="control-label">Name</label>

            <input
              id="untappd-search"
              type="text"
              placeholder="search"
              ref={(i) => { this.qInput = i; }}
              onChange={this.handleSearchThrottled}
            />
          </div>


          <button type="submit" className="btn btn-default">
            <i className="fa fa-search"></i>
            <span data-i18n="admin.untappdConnectSettings.startImport">
              Search
            </span>
          </button>
        </form>

        {this.renderSearchResults()}
      </div>
    );
  }
}