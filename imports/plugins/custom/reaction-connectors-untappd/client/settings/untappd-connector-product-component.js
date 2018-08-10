import React, { Component } from "react";
import PropTypes from "prop-types";

import { a11yOnEnter } from "@brewline/theme/client/lib";

// TODO: wrap this component
export default class UntappdConnectorProductComponent extends Component {
  static propTypes = {
    onAddProduct: PropTypes.func.isRequired,
    product: PropTypes.shape({
      beer: PropTypes.shape({
        bid: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      })
    })
  };

  addProduct = () => {
    this.props.onAddProduct(this.props.product.beer.bid);
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
        onClick={this.addProduct}
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
        <h6>{product.brewery.brewery_name}</h6>
        <p>
          {product.beer.beer_style}
        </p>
      </div>
    );
  }
}
