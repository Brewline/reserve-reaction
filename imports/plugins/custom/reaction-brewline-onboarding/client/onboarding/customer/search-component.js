import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Button } from "/imports/plugins/core/ui/client/components";

import UntappdMarketplaceShop from "@brewline/untappd-connector/client/settings/untappd-marketplace-shop-component";
import { FavoritesBar } from "@brewline/theme/client/components";

export default class Search extends Component {
  static propTypes = {
    inputRef: PropTypes.func,
    onAddShop: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.shape({
      brewery: PropTypes.object
    })),
    watchlistItems: PropTypes.arrayOf(PropTypes.shape({
      displayName: PropTypes.string
    }))
  };

  handleSearch = (e) => {
    e.preventDefault();

    this.props.onSearch(this.qInput.value);

    return false;
  }

  handleSearchThrottled = _.throttle(this.handleSearch, 600);

  renderSearchResult = (brewery, index) => (
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

  renderSearchResults() {
    if (_.get(this.props, "searchResults.length", 0) <= 0) { return; }

    return (
      <div className="panel-search-results">
        <h4>
          Search Results
        </h4>

        <p>
          Tap the breweries you&rsquo;d like to see do online beer releases.
        </p>

        <Components.List className="panel-search-results__list">
          {this.props.searchResults.map(this.renderSearchResult)}
        </Components.List>
      </div>
    );
  }

  renderSearch() {
    const { inputRef } = this.props;

    return (
      <div>
        <form onSubmit={this.handleSearch}>
          <div className="form-group" data-required="true">
            <input
              type="text"
              placeholder="Enter brewery name (results via Untappd)"
              ref={(ref) => {
                // create a local pointer
                this.qInput = ref;

                // call the parent method
                inputRef(ref);
              }}
              onChange={this.handleSearchThrottled}
            />
          </div>

          <Button
            bezelStyle="solid"
            className={{
              "btn": true,
              "btn-lg": true
            }}
            i18nKeyLabel="admin.untappdConnectSettings.startImport"
            icon="search"
            label="Search"
            primary={true}
            type="submit"
          />
        </form>

        {this.renderSearchResults()}
      </div>
    );
  }

  renderFavorites() {
    const { watchlistItems } = this.props;

    return (
      <FavoritesBar
        favorites={watchlistItems}
        onFavoriteClick={this.handleFavoriteClick}
      />
    );
  }

  renderNext() {
    const buttonProps = {};
    const { watchlistItems = [], onNextStep } = this.props;

    if (!watchlistItems.length) {
      return;
    }
    //   buttonProps.bezelStyle = "flat";
    //   buttonProps.label = "Skip";
    //   buttonProps.i18nKeyLabel = "onboarding.skip";
    //   buttonProps.primary = false;
    //   buttonProps.status = "default";
    // } else {
    buttonProps.bezelStyle = "solid";
    buttonProps.label = "Next";
    buttonProps.i18nKeyLabel = "onboarding.next";
    buttonProps.primary = true;
    buttonProps.status = "primary";
    // }

    buttonProps.className = {
      btn: true
    };

    return (
      <Button
        icon="arrow-right"
        iconAfter={true}
        {...buttonProps}
        type="button"
        onClick={onNextStep}
      />
    );
  }

  render() {
    return (
      <div className="admin-controls-content onboarding__step brewline-onboarding__search">
        <h1>Search for your favorite Breweries</h1>

        {this.renderFavorites()}

        <Components.Divider label="search" i18nKeyLabel="accountsUI.search" />

        {this.renderSearch()}

        <Components.Divider />

        <div>
          <div className="pull-right">
            {this.renderNext()}
          </div>
        </div>
      </div>
    );
  }
}
