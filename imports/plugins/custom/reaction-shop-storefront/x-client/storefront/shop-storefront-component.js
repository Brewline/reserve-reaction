import _ from "lodash";
import shallowEqual from "shallowequal";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

function literalComparison(a, b, key) {
  if (!key) { return; } // the entire object is passed through the customizer function. a null key allows us to ignore it
  if (Array.isArray(a) && Array.isArray(b)) { return true; }
  if (_.isObject(a) && _.isObject(b)) { return true; }
}

export function simpleShopComparison(shopA, shopB) {
  if (shopA === shopB) { return true; }
  if (!shopA || !shopB) { return false; }

  const { id: idA, updatedAt: updatedAtA } = shopA;
  const { id: idB, updatedAt: updatedAtB } = shopB;

  return idA === idB && updatedAtA === updatedAtB;
}

export function shouldComponentUpdate(props, nextProps) {
  if (!props) { return !nextProps; }

  const {
    shop = {},
    merchantShops = []
  } = props;

  const {
    shop: nextShop = {},
    merchantShops: nextMerchantShops = []
  } = nextProps;

  if (!shallowEqual(shop, nextShop, literalComparison)) { return true; }

  if (simpleShopComparison(shop, nextShop)) { return true; }

  if (!merchantShops && !nextMerchantShops) { return false; }
  if (merchantShops && !nextMerchantShops) { return true; }
  if (!merchantShops && nextMerchantShops) { return true; }
  if (merchantShops.length !== nextMerchantShops.length) { return true; }

  for (let i = 0; i < merchantShops.length; i += 1) {
    if (!shallowEqual(merchantShops[i], nextMerchantShops[i], literalComparison)) {
      return true;
    }
  }

  return false;
}

export class PrimaryShopStorefront extends Component {
  // require shop
  // allow for merchantShops
  static propTypes = {
    merchantShops: PropTypes.array,
    shop: PropTypes.object.isRequired
  };

  renderHero() {
    const { shop } = this.props;

    return (
      <div>
        <h1>Welcome to {shop.name}!</h1>

        <p>
          {shop.name} is the place to list your upcoming beer release.
        </p>
      </div>
    );
  }

  handleNewShopClick = (event) => {
    event.preventDefault();

    Reaction.Router.go("/welcome/brewery");
  }

  handleShopClick = (shopId) => {
    Reaction.setShopId(shopId);
    Reaction.Router.go("index");
  }

  renderMarketplace() {
    return (
      <Components.ShopGrid
        shops={this.props.merchantShops}
        onNewShopClick={this.handleNewShopClick}
        onShopClick={this.handleShopClick}
      />
    );
  }

  render() {
    return (
      <div className="marketplace-storefront">
        <div key="hero">{this.renderHero()}</div>
        <div key="marketplace">{this.renderMarketplace()}</div>
      </div>
    );
  }
}

// import React, { Component } from "react";
// import PropTypes from "prop-types";
// import { Components } from "@reactioncommerce/reaction-components";

export class MarketplaceShopStorefront extends Component {
  // require shop

  static propTypes = {
    brandMedia: PropTypes.object,
    shop: PropTypes.object
  };

  renderBrand() {
    const { brandMedia } = this.props;

    const logo = brandMedia && brandMedia.url({ store: "thumbnail" });

    return <Components.Brand logo={logo} />;
  }

  linkedIcon(url, provider) {
    return (
      <a
        href={url}
        target="_blank"
        onClick={this.goHome}
      >
        <i className={`fa fa-${provider} fa-2x`} />
      </a>
    );
  }

  urlOption() {
    const { url } =
      _.get(this.props, "shop.UntappdResource.contact", {});

    if (!url) { return; }

    return (
      <a
        href={url}
        target="_blank"
        className="btn"
      >
        {url}
      </a>
    );
  }

  untappdOption() {
    const slug =
      _.get(this.props, "shop.UntappdResource.claimed_status.claimed_slug");

    if (!slug) { return; }

    const url = `https://untappd.com/${slug}`;

    return this.linkedIcon(url, "untappd");
  }

  instagramOption() {
    const { instagram } =
      _.get(this.props, "shop.UntappdResource.contact", {});

    if (!instagram) { return; }

    let url;
    if (instagram.indexOf("http") === 0) {
      url = instagram;
    } else {
      url = `https://www.instagram.com/${instagram}`;
    }

    return this.linkedIcon(url, "instagram");
  }

  facebookOption() {
    const { facebook } =
      _.get(this.props, "shop.UntappdResource.contact", {});

    if (!facebook) { return; }

    let url;
    if (facebook.indexOf("http") === 0) {
      url = facebook;
    } else {
      url = `https://www.facebook.com/${facebook}`;
    }

    return this.linkedIcon(url, "facebook");
  }

  twitterOption() {
    const { twitter } =
      _.get(this.props, "shop.UntappdResource.contact", {});

    if (!twitter) { return; }

    let url;
    if (twitter.indexOf("http") === 0) {
      url = twitter;
    } else {
      url = `https://twitter.com/${twitter}`;
    }

    return this.linkedIcon(url, "twitter");
  }

  socialOptions() {
    return [
      this.untappdOption(),
      this.instagramOption(),
      this.facebookOption(),
      this.twitterOption()
    ].filter((o) => o);
  }

  renderInactiveBanner() {
    let className;
    let message;
    const { shop } = this.props;
    const { active, status: shopStatus, workflow = {} } = shop;
    const { status } = workflow;

    if (active && shopStatus === "active" && status === "active") { return; }

    switch (status) {
      case "disabled":
        className = "danger";
        message = "This shop has been disabled. Please contact us to activate.";
        break;
      case "new": // falls-through
      default:
        className = "info";
        message = "Please contact us to activate your shop.";
    }

    return (
      <div className={`shop-banner ${className}`}>
        {message}
      </div>
    );
  }

  render() {
    const { shop } = this.props;

    // use ReactionLayout?
    return (
      <div>
        {this.renderInactiveBanner()}

        <div className="shop-storefront rui items">
          <div className="shop-storefront__brand rui item static start axis vertical">
            {this.renderBrand()}
          </div>

          <div className="shop-storefront__content rui item variable start axis vertical">
            <h1 className="shop-name">{shop.name}</h1>
            <p>{this.urlOption()}</p>
            <p>{shop.description}</p>

            <ul className="storefront-social flex-wrap justify-content-flex-start">
              {this.socialOptions().map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>

        <Components.Products />
        {/*
          <pre>
            {Object.entries(this.props.shop).map(([k, v]) => (
              `${k}: ${typeof v == 'object' ? 'Object' : v }`
            )).join("\n")}
          </pre>
        */}
      </div>
    );
  }
}

export default class ShopStorefront extends Component {
  static propTypes = {
    shop: PropTypes.object
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   // return fnShouldUpdate(this.props, nextProps) || !shallowEqual(this.state, nextState);
  //   console.log("ShopStorefront#shouldComponentUpdate:", shouldComponentUpdate(this.props, nextProps));
  //   return shouldComponentUpdate(this.props, nextProps);
  // }

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
