// TODO: consider combining with untappd-connector-import-component

import _ from "lodash";
import React, { Component } from "react";
// import { Button, List, ListItem } from "/imports/plugins/core/ui/client/components";
import { List, ListItem } from "/imports/plugins/core/ui/client/components";

import UntappdMarketplaceShop from "./untappd-marketplace-shop-container";

export default class UntappdMarketplaceShops extends Component {
  // static propTypes = {
  //   accessToken: PropTypes.string,
  //   onGetAccessToken: PropTypes.func,
  //   structure: PropTypes.object
  // }

  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.renderSearchResult = this.renderSearchResult.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.onSearch(this.qInput.value);

    return false;
  }

  // renderLogin() {
  //   return (
  //     <div className="panel-group">
  //       <button type="button" onClick={this.props.onGetAccessToken}>
  //         Connect with Untappd
  //       </button>
  //     </div>
  //   );
  // }

  renderSearchForm() {
    return (
      <div className="panel-group">
        <div className="panel-title">
          <h4>
            <span data-i18n="admin.untappdConnectSettings.headingImport">
              Search Untappd
            </span>
          </h4>
        </div>
        <div className="panel-body">
          <form onSubmit={this.onSubmit}>
            <input type="text" placeholder="search" ref={(i) => { this.qInput = i; }} />

            <button type="submit" className="btn btn-default">
              <i className="fa fa-search" />
              <span data-i18n="admin.untappdConnectSettings.startImport">
                Search
              </span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  renderSearchResult(brewery, index) {
    // <i className="fa fa-cloud-download"></i>
    return (
      <ListItem
        className="panel-search-results__shop"
        key={index}
      >
        <UntappdMarketplaceShop brewery={brewery.brewery} />
      </ListItem>
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
          Tap the import icon net to each brewery to create a shop.
        </p>

        <List className="panel-search-results__list">
          {this.props.searchResults.map((r, i) => this.renderSearchResult(r, i))}
        </List>
      </div>
    );
  }

  render() {
    // if (!this.props.hasAccessToken) {
    //   return this.renderLogin();
    // }

    return (
      <div>
        {this.renderSearchForm()}

        {this.renderSearchResults()}
      </div>
    );
  }
}
