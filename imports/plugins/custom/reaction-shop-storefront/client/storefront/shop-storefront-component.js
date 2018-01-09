import _ from "lodash";
import React, { Component } from "react";
import { Components } from "@reactioncommerce/reaction-components";

export class PrimaryShopStorefront extends Component {
  renderHero() {
    return (
      <div>
        <h1>Welcome to {this.props.shop.name}!</h1>

        <p>
          {this.props.shop.name} is your
        </p>
      </div>
    );
  }

  renderMarketplace() {
    return (
      <ul>
        {_.map(this.props.marketplaceShops, (shop) => {
          <li>{shop.name}</li>
        })}
      </ul>
    );
  }

  render() {
    return (
      <div>
        <div key="hero">{this.renderHero()}</div>
        <div key="marketplace">{this.renderMarketplace()}</div>
      </div>
    );
  }
}

export class MarketplaceShopStorefront extends Component {
  render() {
    return (
      <h1>Marketplace Shop</h1>
    );
  }
}

export default class ShopStorefront extends Component {
  // static propTypes = {
  //   shop: PropTypes.object
  // }

  constructor(props) {
    super(props);
  }

  isPrimaryShop() {
    return this.props.shop.shopType === "primary"; // TODO: add method to Shop
  }

  render() {
    let content;

    if (!this.props.shop) {
      content = <Components.Loading />;
    } else if (this.isPrimaryShop()) {
      content = <PrimaryShopStorefront {...this.props} />;
    } else {
      content = <MarketplaceShopStorefront {...this.props} />;
    }

    return <div className="container-main">{content}</div>;
  }
}
