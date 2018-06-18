import React, { Component } from "react";
import _ from "lodash";
import { Button } from "/imports/plugins/core/ui/client/components";

const FEATURES = [{
  icon: "at",
  title: "Customer Information",
  description: "Get the name and email address of every customer"
}, {
  icon: "exclamation-triangle",
  title: "FOMO & Urgency",
  description: "Capitalize on customer excitement by taking orders as soon as you announce"
}, {
  icon: "users",
  title: "Network Effects",
  description: "Sharing on Facebook, Instagram, Twitter, and Untappd helps spread the word"
}, {
  icon: "thumbs-up",
  title: "Reviews",
  description: "Follow up with customers to garner reviews on Facebook, Yelp, Google, and Foursquare"
}, {
  icon: "line-chart",
  title: "Data Analysis",
  description: "Learn more about your customers"
}, {
  icon: "cogs",
  title: "Inventory Control",
  description: "Set limits, Schedule pickup times"
}];

export default class About extends Component {
  renderHero() {
    return (
      <div className="hero-wrapper">
        <h1 className="hero-title">
          The Beer Release platform made for Brewers
        </h1>

        <div className="hero-content">
          <p className="large">
            We all know that beer releases are a great way to move product, test
            new lines, and build excitement for your beer.
            Take it to the next level with Brewline.
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
          <h3>All the features you need</h3>

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
          Ready to start your next beer release online?
        </p>

        {this.renderButton()}
      </div>
    );
  }

  renderButton() {
    return (
      <div className="button-with-annotation">
        <Button
          className={{
            "btn": true,
            "btn-primary": true,
            "btn-lg": true,
            "flat": false
          }}
          onClick={this.props.onNextStep}
        >
          Set up my shop
        </Button>

        <em className="annotation">{"(done in minutes)"}</em>
      </div>
    );
  }

  render() {
    return (
      <div className="brewline-onboarding__about">
        {this.renderHero()}

        {this.renderFeatures()}

        {this.renderCta()}
      </div>
    );
  }
}
