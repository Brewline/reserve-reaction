import React, { Component } from "react";
import { Button, List, ListItem } from "/imports/plugins/core/ui/client/components";

// TOOD: wrap this component
export default class UntappdConnectorProductComponent extends Component {
  constructor(props) {
    super(props);

    this.addProduct = this.addProduct.bind(this);
  }

  addProduct() {
    this.props.onAddProduct(this.props.product.beer.bid);
  }

  render() {
    const { product } = this.props;

    return (
      <div
        className="untappd-connector-product__details"
        style={{
          clear: "both"
        }}
        onClick={this.addProduct}
      >
        <img
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

