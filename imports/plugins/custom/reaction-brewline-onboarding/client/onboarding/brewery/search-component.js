import _ from "lodash";
import React, { Component } from "react";
import { Components } from "@reactioncommerce/reaction-components";
import { Button } from "/imports/plugins/core/ui/client/components";

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
            this.props.searchResults.map((r, i) => this.renderSearchResult(r, i))
          }
        </Components.List>
      </div>
    );
  }

  renderStepComplete() {
    const shopName = _.get(this.props, "currentBrewery.name", "Your brewery");

    return (
      <div>
        <p>
          Great! {shopName} has already been created.
        </p>

        <Button
          bezelStyle="solid"
          className={{
            "btn": true,
            "btn-lg": true,
            "btn-success": true
          }}
          label="Next step"
          onClick={this.props.onNextStep}
          primary={true}
        />
      </div>
    );
  }

  renderAutoComplete() {
    const breweryId = _.get(this.props, "userBrewery.brewery_id");
    return (
      <div>
        <p>
          Great! Using your brewery&rsquo;s Untappd account, we can create it
          automatically.
        </p>

        <Button
          bezelStyle="solid"
          className={{
            "btn": true,
            "btn-lg": true,
            "btn-success": true
          }}
          label="Next step"
          onClick={() => this.props.onAddShop(breweryId)}
          primary={true}
        />
      </div>
    );
  }

  renderStepIncomplete() {
    return (
      <div>
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


          <Button
            bezelStyle="solid"
            className={{
              "btn": true,
              "btn-lg": true
            }}
            icon="search"
            primary={true}
            type="submit"
          >
            <span data-i18n="admin.untappdConnectSettings.startImport">
              Search
            </span>
          </Button>
        </form>

        {this.renderSearchResults()}
      </div>
    );
  }

  render() {
    let content;

    if (this.props.currentBrewery) {
      content = this.renderStepComplete();
    } else if (this.props.userBrewery) {
      content = this.renderAutoComplete();
    } else {
      content = this.renderStepIncomplete();
    }

    return (
      <div className="admin-controls-content onboarding__step brewline-onboarding__search">
        <h1>Search for your Brewery</h1>

        {content}
      </div>
    );
  }
}
