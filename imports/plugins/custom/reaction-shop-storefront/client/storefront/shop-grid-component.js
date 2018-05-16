// ******
// Ripped from components/productGrid.js
// s/product/shop
// ******

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class ShopGrid extends Component {
  static propTypes = {
    shops: PropTypes.array,
    showAddShop: PropTypes.bool
  }

  renderAddShopGridItem() {
    // if (!this.props.showNewShopCta) { return; }

    // const weightClass = this.props.weightClass();
    const weightClass = "";

    return (
      <li
        className={`product-grid-item ${weightClass}`}
      >
        <div>
          <span className="product-grid-item-alerts" />

          <button
            className="product-grid-item-images product-grid-item-images--new"
            on-click={this.onNewShopClick()}
            data-event-category="grid"
            data-event-label="grid shop click"
            data-event-value="new"
          >
            <div>
              <div className="title">
                Import your shop in minutes
              </div>
              <div className="cta">
                We import data from Untappd so you will be up and running <em>fast</em>
              </div>
              <div className="subtitle">
                <strong>Now accepting requests for early access!</strong>
              </div>
            </div>
          </button>

          {/* ^^ not sure we need all of this ^^ */}
          <div className="grid-content">
            <button
              on-click={this.onNewShopClick()}
              data-event-category="grid"
              data-event-action="shop-click"
              data-event-label="grid shop click"
              data-event-value="new"
            >
              <div className="overlay">
                <div className="overlay-title">Your Shop Here!</div>
              </div>
            </button>
          </div>
        </div>
      </li>
    );
  }

  renderShopGridItems(shops) {
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

            {this.renderAddShopGridItem()}
          </ul>
        </div>
      </div>
    );
  }
}

export default ShopGrid;
