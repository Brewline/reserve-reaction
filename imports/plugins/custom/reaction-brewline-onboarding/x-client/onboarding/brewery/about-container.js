import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
// import { Reaction } from "/client/api";
// import { Products, Media } from "/lib/collections";

import About from "./about-component";

function composer(props, onData) {
  onData(null, props);
}

registerComponent(
  "OnboardingBreweryAbout",
  About,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(About);
