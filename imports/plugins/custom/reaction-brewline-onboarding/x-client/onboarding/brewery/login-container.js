import ReactGA from "react-ga";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import {
  composeWithTracker,
  registerComponent
} from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import Login from "./login-component";

function composer(props, onData) {
  const onLogin = () => {
    ReactGA.event({
      category: "Auth",
      action: "Brewery Onboarding Sign Up w/Untappd"
    });

    Meteor.loginWithUntappd({ source: "onboardingBrewery" }, (error) => {
      if (error) {
        console.log(error);
      } else {
        ReactGA.event({
          category: "Auth",
          action: "Brewery Onboarding Sign Up Complete"
        });

        props.onNextStep();
      }
    });
  };

  let onLoginHandler;
  const eventHandlers = [];
  const onOpenSignUpModal = () => {
    ReactGA.event({
      category: "Auth",
      action: "Brewery Onboarding Sign Up"
    });

    onLoginHandler = Accounts.onLogin(() => {
      props.onNextStep();

      ReactGA.event({
        category: "Auth",
        action: "Brewery Onboarding Sign Up Complete"
      });
    });

    [
      "onCreateUser", "onLogin", "onLoginFailure", "onExternalLogin", "onLogout"
    ].filter((h) => Accounts[h]).forEach((hook) => {
      eventHandlers[hook] = Accounts[hook]((...args) => {
        console.log(hook, ...args);
      });
    });
  };

  const onCloseSignUpModal = () => {
    if (onLoginHandler && onLoginHandler.stop) {
      onLoginHandler.stop();
    }
    eventHandlers.forEach((h) => h.stop());

    ReactGA.event({
      category: "Auth",
      action: "Brewery Onboarding Sign Up Cancelled"
    });
  };

  let loggedInUser;
  if (!Reaction.hasPermission("anonymous")) {
    loggedInUser = Meteor.user();
  }

  onData(null, {
    ...props,
    loggedInUser,
    onLogin,
    onCloseSignUpModal,
    onOpenSignUpModal
  });
}

registerComponent(
  "OnboardingBreweryLogin",
  Login,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(Login);
