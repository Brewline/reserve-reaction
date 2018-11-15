import _ from "lodash";
import React, { Component } from "react";

export default class WhatsNext extends Component {
  getShopName(defaultValue = "") {
    const shopName = _.get(this.props, "shop.name");

    return shopName || defaultValue;
  }

  getProductName() {
    return _.get(this.props, "product.name");
  }

  render() {
    return (
      <div className="onboarding__step brewline-onboarding__whats-next">
        <h1>You&rsquo;re Almost Done!</h1>

        <p>
          {this.getShopName("Your shop")} has been created on the Brewline
          platform and you are almost ready to launch your {this.getProductName()}
          beer release.
        </p>

        <h3>What&rsquo;s Next:</h3>

        <p>
          Scott or Pat, Brewline&rsquo;s founders, will reach out to make sure
          all the boxes are checked to begin selling (e.g., setting up an
          account with Stripe so you can get paid; creating a subdomain on
          brewline.io for your shop; creating purchase limits; etc.). Afterward
          your shop will be activated and you may begin pre-selling your next
          beer release.
        </p>

        <p>
          Until then, you can visit your shop and update any of its information,
          import additional beers, add new beers or products, set available
          quantities and limits, or just explore.
        </p>

        <button className="btn btn-primary" onClick={this.props.done}>
          Go to {this.getShopName("your shop")}
        </button>
      </div>
    );
  }
}
