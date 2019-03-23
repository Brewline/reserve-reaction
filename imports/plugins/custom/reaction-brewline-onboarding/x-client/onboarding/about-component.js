import React, { PureComponent, Fragment } from "react";
import PropTypes from "prop-types";
import { Button } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";

export default class About extends PureComponent {
  static propTypes = {
    gotoBrewerOnboarding: PropTypes.func.isRequired,
    gotoCustomerOnboarding: PropTypes.func.isRequired
  }

  renderHero() {
    return (
      <div className="hero-wrapper">
        <h1 className="hero-title">
          Reserve Online. Skip the Line. Brewline
        </h1>

        <div className="hero-content">
          <p className="large">
            The freshest, best-tasting, most innovative beer today is not sold
            in stores. It can only be found in the tap rooms of your local
            breweries.
          </p>

          <p>
            Find out more about what Brewline can do for you...
          </p>
        </div>

        <Components.Divider />
      </div>
    );
  }

  renderBrewerCta() {
    return (
      <Fragment>
        <h3>
          Craft Brewers
        </h3>

        <p>
          Get started now. Your brewery can be set up for online pre-sales in
          just a few minutes. Click to learn more.
        </p>

        <Button
          bezelStyle="solid"
          className={{
            "btn": true,
            "btn-lg": true,
            "btn-block": true,
            "btn-success": true
          }}
          i18nKeyLabel="brewline.onboarding.brewerCta"
          label="I am a Brewer"
          onClick={this.props.gotoBrewerOnboarding}
          primary={true}
          type="button"
        />
      </Fragment>
    );
  }

  renderCustomerCta() {
    return (
      <Fragment>
        <h3>
          Craft Beer Lovers
        </h3>

        <p>
          Find out whether your favorite craft brewers are on Brewline
          and be notified of new releases near you.
        </p>

        <Button
          bezelStyle="solid"
          className={{
            "btn": true,
            "btn-lg": true,
            "btn-block": true,
            "btn-success": true
          }}
          i18nKeyLabel="brewline.onboarding.customerCta"
          label="I drink Craft Beer"
          onClick={this.props.gotoCustomerOnboarding}
          primary={true}
          type="button"
        />
      </Fragment>
    );
  }

  render() {
    return (
      <div className="onboarding__step brewline-onboarding__about">
        {this.renderHero()}

        <div className="call-to-action-group flex-box">
          <div className="call-to-action flex-1">
            {this.renderBrewerCta()}
          </div>

          <div className="call-to-action flex-1">
            {this.renderCustomerCta()}
          </div>
        </div>
      </div>
    );
  }
}
