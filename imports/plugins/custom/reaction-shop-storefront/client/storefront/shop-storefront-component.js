import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

export class PrimaryShopStorefront extends Component {
  // require shop
  // allow for merchantShops

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
    return <Components.ShopGrid
      shops={this.props.merchantShops}
      onNewShopClick={this.handleNewShopClick}
      onShopClick={this.handleShopClick}
    />;
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

    return (
      <a
        href={`https://untappd.com/${slug}`}
        target="_blank"
        className="btn btn-link"
      >
        Untappd
      </a>
    );
    // return this.linkedIcon(, "untappd");
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

  render() {
    const { shop } = this.props;

    // use ReactionLayout?
    return (
      <div>
        <div className="shop-storefront rui items flex-nowrap">
          <div className="shop-storefront__brand rui item static start axis vertical">
            {this.renderBrand()}
          </div>

          <div className="shop-storefront__content rui item variable start axis vertical">
            <h1 className="shop-name">{shop.name}</h1>
            <p>{this.urlOption()}</p>
            <p>{shop.description}</p>

            <ul className="storefront-social flex-wrap">
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
  // static propTypes = {
  //   shop: PropTypes.object
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
