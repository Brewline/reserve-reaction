import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

import UntappdProductComponent from "./untappd-product-component";

export const DEFAULT_SORT = "-created";

export default class Products extends Component {
  static propTypes = {
    children: PropTypes.node,
    onClearSearch: PropTypes.func,
    onClickProduct: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    searchResults: PropTypes.arrayOf(PropTypes.object)
  };

  state = {
    fields: {
      q: "",
      sort: DEFAULT_SORT
    }
  }

  handleFieldChange = (_event, value, name) => {
    const { fields } = this.state;

    fields[name] = value;

    this.setState({ fields });
  }

  handleSortFieldChange = (_event, value, name) => {
    const { fields } = this.state;

    if (value) {
      fields[name] = DEFAULT_SORT;
    } else {
      delete fields[name];
    }

    this.setState({ fields });
    this.handleSubmit();
  }

  handleSubmit = (event) => {
    event && event.preventDefault && event.preventDefault();

    const { fields: { q, sort } } = this.state;
    this.props.onSearch(q, sort);
  }

  renderSearchResult(product, index) {
    // <i className="fa fa-cloud-download"></i>
    return (
      <Components.ListItem
        className="panel-search-results__shop"
        key={index}
      >
        <UntappdProductComponent
          product={product}
          onClickProduct={this.props.onClickProduct}
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

  renderSearchForm() {
    const { fields } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <Components.TextField
          i18nKeyLabel="search.q"
          label="Search"
          onChange={this.handleFieldChange}
          name="q"
          value={fields.q}
        />

        {/*
        <Components.Switch
          checked={fields.sort === DEFAULT_SORT}
          i18nKeyLabel="search.sort"
          i18nKeyOnLabel="search.sort"
          label="Default sort"
          name="sort"
          onChange={this.handleSortFieldChange}
          onLabel="Most recent first"
        />
        */}

        <div className="row text-right">
          {/* TODO: Clear Search */}
          <Components.Button
            buttonType="submit"
            className="btn btn-primary"
            bezelStyle="solid"
            i18nKeyLabel="app.searchProducts"
            label="Search Products"
          />
        </div>
      </form>
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

        <Components.Divider />

        {this.renderSearchForm()}

        {this.renderSearchResults()}
      </div>
    );
  }
}
