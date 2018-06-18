import React, { Component } from "react";
import _ from "lodash";
import { Button } from "/imports/plugins/core/ui/client/components";

export default class Login extends Component {
  renderLoggedIn() {
    return (
      <div>
        <p>
          Great! You&rsquo;re already logged in.
        </p>

        <Button
          className={{
            "btn": true,
            "btn-primary": true,
            "btn-lg": true,
            "flat": false
          }}
          onClick={this.props.onNextStep}
        >
          Next step
        </Button>
      </div>
    );
  }

  renderAnonymous() {
    return (
      <div>
        <p>
          First things first, please login.
        </p>

        <p>
          Using your Untappd account, we can import your brewery and beers
          automatically.
        </p>

        <Button
          className={{
            "btn": true,
            "btn-primary": true,
            "btn-lg": true,
            "flat": false
          }}
          onClick={this.props.onLogin}
        >
          Login with Untappd
        </Button>
      </div>
    );
  }

  render() {
    let content;

    if (!_.isEmpty(this.props.loggedInUser)) {
      content = this.renderLoggedIn();
    } else {
      content = this.renderAnonymous();
    }

    return (
      <div className="brewline-onboarding__about">
        <h1>Create an account on Brewline</h1>

        {content}
      </div>
    );
  }
}
