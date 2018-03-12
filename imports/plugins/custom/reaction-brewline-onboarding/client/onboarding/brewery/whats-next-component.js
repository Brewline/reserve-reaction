import _ from "lodash";
import React, { Component } from "react";

export default class WhatsNext extends Component {
  getShopName(prefix = "", suffix = "") {
    const shopName = _.get(this.props, "shop.name");

    if (!shopName) { return; }

    return `${prefix}${shopName}${suffix}`;
  }

  getProductName() {
    return _.get(this.props, "product.name");
  }

  render() {
    return (
      <div>
        <h1>You&rsquo;re Almost Done!</h1>

        <p>
          Your shop{this.getShopName(", ", ",")} has been created on the Brewline
          platform and you are almost ready to your {this.getProductName()} beer
          release.
        </p>

        <h3>What&rsquo;s Next:</h3>

        <p>
          Scott or Pat, Brewline&rsquo;s founders, will reach out to make sure
          all the boxes are checked to begin selling (e.g., setting up an
          account with Stripe, so you can get paid; creating a subdomain on
          brewline.io for your shop; creating purchase limits; etc.). Afterward
          your shop will be activated and you may begin pre-selling your next
          release.
        </p>

        <p>
          Until then, you can visit your shop and update any of its information,
          import additional beers to be part of your release, add new beers or
          products, set available quantities and limits, or just explore.
        </p>

        <button className="btn btn-primary" onClick={this.props.onNextStep}>
          Go to {this.getShopName()}
        </button>
      </div>
    );
  }
}
