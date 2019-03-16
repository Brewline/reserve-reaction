import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";

import About from "./about-component";

function composer(props, onData) {
  onData(null, props);
}

registerComponent(
  "OnboardingCustomerAbout",
  About,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(About);
