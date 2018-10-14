import React, { Component } from "react";
import PropTypes from "prop-types";

import { a11yOnEnter } from "../lib";

export default class UntappdProductComponent extends Component {
  static propTypes = {
    onClickProduct: PropTypes.func.isRequired,
    product: PropTypes.shape({
      beer: PropTypes.shape({
        bid: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        beer_name: PropTypes.string, // eslint-disable-line camelcase
        beer_style: PropTypes.string // eslint-disable-line camelcase
      }),
      brewery: PropTypes.shape({
        brewery_name: PropTypes.string // eslint-disable-line camelcase
      })
    })
  };

  handleClickProduct = () => {
    this.props.onClickProduct(this.props.product.beer);
  }

  render() {
    const { product } = this.props;

    return (
      <div
        className="untappd-connector-product__details"
        style={{
          clear: "both",
          overflow: "hidden"
        }}
        role="button"
        tabIndex={0}
        onClick={this.handleClickProduct}
        onKeyDown={a11yOnEnter(this.addProduct)}
      >
        <img
          alt={product.beer.beer_name}
          src={product.beer.beer_label}
          style={{
            float: "left",
            marginRight: "5px",
            maxWidth: "100px",
            maxHeight: "100px"
          }}
        />
        <h4>{product.beer.beer_name}</h4>
        <h6>{product.brewery && product.brewery.brewery_name}</h6>
        <p>
          {product.beer.beer_style}
        </p>
      </div>
    );
  }
}
