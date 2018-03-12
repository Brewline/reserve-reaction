import React, { Component } from "react";

export default class About extends Component {
  render() {
    return (
      <div className="brewline-onboarding__about">
        <h1>Welcome to Brewline</h1>

        <p>
          Ready to start your next beer release online?
        </p>

        <ul>
          <li>Collection contact information</li>
          <li>Analyze customer data</li>
          <li>Encourage social sharing on Facebook, Instagram, Twitter, and Untappd</li>
          <li>Gather reviews on Facebook, Yelp, Google, and Foursquare</li>
        </ul>

        <div className="button-with-annotation">
          <button className="btn btn-primary" onClick={this.props.onNextStep}>
            Set up my shop
          </button>

          <em className="annotation">{"(takes < 3 minutes!)"}</em>
        </div>
      </div>
    );
  }
}
