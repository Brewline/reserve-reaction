import React, { Component } from "react";

export default class Login extends Component {
  render() {
    return (
      <div className="brewline-onboarding__about">
        <p>
          First things first, please login.
        </p>

        <p>
          Using your Untappd account, we can import you brewery and beers with
          just a few clicks.
        </p>

        <button className="btn btn-primary" onClick={this.props.onLogin}>
          Login with Untappd
        </button>
      </div>
    );
  }
}
