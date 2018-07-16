import React, { Component } from "react";
import PropTypes from "prop-types";

import { a11yOnEnter } from "./a11yHelpers";

// TODO: wrap this component
export default class UntappdMarketplaceShopComponent extends Component {
  static propTypes = {
    brewery: PropTypes.shape({
      brewery_id: PropTypes.oneOfType([ // eslint-disable-line camelcase
        PropTypes.string,
        PropTypes.number
      ])
    }),
    onAddShop: PropTypes.func.isRequired
  }

  handleAddShop = () => {
    this.props.onAddShop(this.props.brewery.brewery_id);
  }

  render() {
    const {
      brewery: {
        brewery_label: breweryLabel,
        brewery_name: breweryName
      }
    } = this.props;

    return (
      <div
        className="untappd-connector-product__details"
        style={{
          clear: "both",
          overflow: "hidden"
        }}
        role="button"
        tabIndex={0}
        onClick={this.handleAddShop}
        onKeyDown={a11yOnEnter(this.handleAddShop)}
      >
        <img
          src={breweryLabel}
          style={{
            float: "left",
            marginRight: "5px",
            maxWidth: "100px",
            maxHeight: "100px"
          }}
          alt={breweryName}
        />
        <h4>{breweryName}</h4>
      </div>
    );
  }
}

