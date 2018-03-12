import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import {
  composeWithTracker,
  registerComponent
} from "@reactioncommerce/reaction-components";
// import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import Login from './login-component';

function composer(props, onData) {
  const onLogin = () => {
    Meteor.loginWithUntappd({ source: "onboardingBrewery" }, (error) => {
      if (error) {
        console.log(error);
      } else {
        props.onNextStep();
      }
    });
  };

  onData(null, {
    ...props,
    onLogin
  });
}

registerComponent(
  "OnboardingBreweryLogin",
  Login,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(Login);
