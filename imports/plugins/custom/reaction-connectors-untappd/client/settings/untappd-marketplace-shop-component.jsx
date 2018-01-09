import React, { Component } from "react";
import { Button, List, ListItem } from "/imports/plugins/core/ui/client/components";

// TOOD: wrap this component
export default class UntappdMarketplaceShopComponent extends Component {
  constructor(props) {
    super(props);

    this.handleAddShop = this.handleAddShop.bind(this);
  }

  handleAddShop() {
    this.props.onAddShop(this.props.brewery.brewery_id);
  }

  render() {
    const { brewery } = this.props;

    return (
      <div
        className="untappd-connector-product__details"
        style={{
          clear: "both",
          overflow: "hidden"
        }}
        onClick={this.handleAddShop}
      >
        <img
          src={brewery.brewery_label}
          style={{
            float: "left",
            marginRight: "5px",
            maxWidth: "100px",
            maxHeight: "100px"
          }}
        />
        <h4>{brewery.brewery_name}</h4>
      </div>
    );
  }
}

