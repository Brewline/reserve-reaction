// ******
// Ripped from components/productGridItems.js
// s/product/shop
// ******

import React, { Component } from "react";
import PropTypes from "prop-types";

export default class ShopGridItems extends Component {
  static propTypes = {
    canEdit: PropTypes.bool,
    // connectDragSource: PropTypes.func,
    // connectDropTarget: PropTypes.func,
    isMediumWeight: PropTypes.func,
    media: PropTypes.func,
    onClick: PropTypes.func,
    positions: PropTypes.func,
    shop: PropTypes.object,
    shopPath: PropTypes.func,
    weightClass: PropTypes.func
  }

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }

  renderOverlay() {
    if (this.props.shop.isVisible === false) {
      return (
        <div className="product-grid-overlay" />
      );
    }
  }

  renderMedia() {
    const media = this.props.media();
    let backgroundImageUrl;
    let mediaClassName;

    if (!media) {
      mediaClassName = "placeholder-image";
      backgroundImageUrl = "/resources/placeholder.gif";
    } else {
      mediaClassName = "shop-image";
      backgroundImageUrl = media.url({ store: "large" });
    }

    return (
      <span
        className={`product-image ${mediaClassName}`}
        style={{
          backgroundImage: `url('${backgroundImageUrl}')`
        }}
      />
    );
  }

  renderGridContent() {
    return (
      <div className="grid-content">
        <a
          href={this.props.shopPath()}
          data-event-category="grid"
          data-event-action="shop-click"
          data-event-label="grid shop click"
          data-event-value={this.props.shop._id}
          onDoubleClick={this.handleClick}
          onClick={this.handleClick}
        >
          <div className="overlay">
            <div className="overlay-title">{this.props.shop.name}</div>
          </div>
        </a>
      </div>
    );
  }

  render() {
    return (
      <li
        className={`product-grid-item ${this.props.weightClass()}`}
        data-id={this.props.shop._id}
        id={this.props.shop._id}
      >
        <div>
          <span className="product-grid-item-alerts" />

          <a className="product-grid-item-images"
            href={this.props.shopPath()}
            data-event-category="grid"
            data-event-label="grid shop click"
            data-event-value={this.props.shop._id}
            onClick={this.handleClick}
          >
            <div className="product-primary-images">
              {this.renderMedia()}
              {this.renderOverlay()}
            </div>
          </a>

          {this.renderGridContent()}
        </div>
      </li>
    );
  }
}
