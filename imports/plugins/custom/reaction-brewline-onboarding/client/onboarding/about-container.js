import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
// import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";
import { Router } from "/client/modules/router";

import About from "./about-component";

function gotoBrewerOnboarding() {
  Router.go("brewlineOnboardingBrewery");
}

function gotoCustomerOnboarding() {
  Router.go("brewlineOnboardingCustomer");
}

function composer(props, onData) {
  onData(null, {
    ...props,
    gotoBrewerOnboarding,
    gotoCustomerOnboarding
  });
}

registerComponent(
  "OnboardingAbout",
  About,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(About);
