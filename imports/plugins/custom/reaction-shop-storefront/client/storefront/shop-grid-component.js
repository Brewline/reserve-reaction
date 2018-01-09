// ******
// Ripped from components/productGrid.js
// s/product/shop
// ******

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class ShopGrid extends Component {
  static propTypes = {
    shops: PropTypes.array
  }

  renderShopGridItems = (shops) => {
    if (Array.isArray(shops)) {
      return shops.map((shop, index) => {
        return (
          <Components.ShopGridItems
            {...this.props}
            shop={shop} key={index} index={index}
          />
        );
      });
    }
    return (
      <div className="row">
        <div className="text-center">
          <h3>
            <Components.Translation defaultValue="No Shops Found" i18nKey="app.noShopsFound" />
          </h3>
        </div>
      </div>
    );
  }

  render() {
          // <Components.DragDropProvider>
          // </Components.DragDropProvider>
    return (
      <div className="container-main">
        <div className="product-grid">
            <ul className="product-grid-list list-unstyled" id="product-grid-list">
              {this.renderShopGridItems(this.props.shops)}
            </ul>
        </div>
      </div>
    );
  }
}

export default ShopGrid;
