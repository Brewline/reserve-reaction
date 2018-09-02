import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { VelocityComponent } from "velocity-react";
import { Components } from "@reactioncommerce/reaction-components";
import { Modal } from "@brewline/theme/client/components";

export default class Login extends Component {
  static propTypes = {
    loggedInUser: PropTypes.object,
    onCloseSignUpModal: PropTypes.func,
    onLogin: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onOpenSignUpModal: PropTypes.func
  };

  state = {
    shouldShowAuthModal: false
  };

  handleClickSignUp = () => {
    const { onOpenSignUpModal } = this.props;

    this.setState({ shouldShowAuthModal: true });

    if (!onOpenSignUpModal) { return; }

    onOpenSignUpModal();
  }

  handleRequestClose = () => {
    const { onCloseSignUpModal } = this.props;

    this.setState({ shouldShowAuthModal: false });

    if (!onCloseSignUpModal) { return; }

    onCloseSignUpModal();
  }

  renderLoggedIn() {
    return (
      <div>
        <p>
          Great! You&rsquo;re already logged in.
        </p>

        <Components.Button
          bezelStyle="solid"
          className={{
            "btn": true,
            "btn-lg": true,
            "btn-success": true
          }}
          onClick={this.props.onNextStep}
          primary={true}
        >
          Next step
        </Components.Button>
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

        <VelocityComponent animation="callout.shake" runOnMount={true}>
          <Components.Button
            bezelStyle="solid"
            className={{
              "btn": true,
              "btn-lg": true,
              "btn-success": true
            }}
            onClick={this.props.onLogin}
            primary={true}
          >
            Login with Untappd
          </Components.Button>
        </VelocityComponent>

        <Components.Divider />

        <p>
          We use information from Untappd to 1) create your account (using
          your email), 2) create your shop, 3) import the beers that you choose.
          We chose Untappd for your convenience and as a way to verify Brewery
          ownership.
        </p>

        <p>
          We do not post, toast, or otherwise change content on your behalf.
        </p>

        <p>
          <Components.Button
            className={{
              "btn": false,
              "btn-default": false
            }}
            label="Prefer to set up your account manually? click here."
            i18nKeyLabel="onboarding.manualShopCreationCta"
            data-event-category="accounts"
            onClick={this.handleClickSignUp}
          />
        </p>

        <Modal
          isOpen={this.state.shouldShowAuthModal}
          onRequestClose={this.handleRequestClose}
          size="sm"
        >
          <Components.Login
            loginFormCurrentView="loginFormSignUpView"
          />
        </Modal>
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
      <div className="onboarding__step brewline-onboarding__login">
        <h1>Create an account on Brewline</h1>

        {content}
      </div>
    );
  }
}
