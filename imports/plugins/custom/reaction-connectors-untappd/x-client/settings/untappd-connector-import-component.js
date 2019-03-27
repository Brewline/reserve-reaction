import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { List, ListItem } from "/imports/plugins/core/ui/client/components";

import UntappdConnectorProduct from "./untappd-connector-product-container";

export default class UntappdConnectorImport extends Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.object)
  }

  onSubmit = (e) => {
    e.preventDefault();

    this.props.onSearch(this.qInput.value);

    return false;
  }

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
            <input
              type="text"
              placeholder="search"
              ref={(i) => { this.qInput = i; }}
            />

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

  renderSearchResult = (product, index) => (
    <ListItem
      className="panel-search-results__product"
      key={index}
    >
      <UntappdConnectorProduct product={product} />
    </ListItem>
  )

  renderSearchResults() {
    if (_.get(this.props, "searchResults.length", 0) <= 0) { return; }

    return (
      <div className="panel-search-results">
        <h4>
          Search Results
        </h4>

        <p>
          Tap the import icon net to each beer to add it to your shop.
        </p>

        <List className="panel-search-results__list">
          {this.props.searchResults.map((r, i) => this.renderSearchResult(r, i))}
        </List>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderSearchForm()}

        {this.renderSearchResults()}
      </div>
    );
  }
}
