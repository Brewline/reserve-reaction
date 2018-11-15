import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { VelocityComponent } from "velocity-react";
import { Button } from "/imports/plugins/core/ui/client/components";

const FEATURES = [{
  icon: "shopping-cart",
  title: "Reserve Online",
  description: "Get the name and email address of every customer"
}, {
  icon: "flag-checkered",
  title: "Skip the Line",
  description: "Show up to the brewery on your time and pick up without waiting"
}, {
  icon: "trophy",
  title: "Early Access",
  description: "Be notified before the general public of upcoming beer releases"
}, {
  icon: "gift",
  title: "Earn Free Stuff",
  description: "Breweries reward their most loyal customers with swag and invite-only events"
}];

export default class About extends Component {
  static propTypes = {
    onNextStep: PropTypes.func
  };

  renderHero() {
    return (
      <div className="hero-wrapper">
        <h1 className="hero-title">
          Your direct line to the hottest beer releases
        </h1>

        <div className="hero-content">
          <p className="large">
            Many of today&rsquo;s most popular breweries sell product on-site at
            specific times&hellip; usually when you are at work!
          </p>

          <p>
            {"With Brewline, you reserve online and pick up at "}
            <em>your</em>
            {" convenience."}
          </p>

          <p>
            Reserve online. Skip the line. Brewline
          </p>

          {this.renderButton()}
        </div>
      </div>
    );
  }

  renderFeatures() {
    return (
      <div className="features-wrapper">
        <div className="features-content">
          <div className="features">
            <div className="row">
              {_.map(FEATURES, (feature, index) => (
                <div
                  className="col-sm-12 col-md-6 media"
                  key={index}
                >
                  <div className="media-left">
                    <i className={`icon fa fa-4x pull-left fa-${feature.icon}`} />
                  </div>
                  <div className="media-body">
                    <h4 className="media-heading">{feature.title}</h4>
                    <p>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCta() {
    return (
      <div className="cta-wrapper">
        <p>
          Find out whether your favorite brewery is already on Brewline!
        </p>

        {this.renderButton()}
      </div>
    );
  }

  renderButton() {
    return (
      <VelocityComponent animation="callout.shake" runOnMount={true}>
        <Button
          bezelStyle="solid"
          className={{
            "btn": true,
            "btn-lg": true,
            "btn-success": true,
            "btn-center": true
          }}
          label="Search Breweries"
          onClick={this.props.onNextStep}
          primary={true}
        />
      </VelocityComponent>
    );
  }

  render() {
    return (
      <div className="onboarding__step brewline-onboarding__about">
        {this.renderHero()}

        {this.renderFeatures()}

        {this.renderCta()}
      </div>
    );
  }
}
