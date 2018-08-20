import ReactGA from "react-ga";
import { Meteor } from "meteor/meteor";
import { Router } from "/client/api";
import { Accounts } from "meteor/accounts-base";

import "./favicon";

function addBodyClass() {
  if (addBodyClass.oneAndDone) { return; }

  document.querySelector("body").setAttribute("data-ready", "true");

  addBodyClass.oneAndDone = true;
}

// function logSomeContext(context) {
//   console.log("The current route details...");
//   console.log("Params: ", context.params);
//   console.log("Query Params: ", context.queryParams);
//   console.log("Path: ", context.path);
//   console.log("The route object: ", context.route);
// }

// log out route details on every route
Router.Hooks.onEnter(addBodyClass);

const BREWLINE_TRACKING_ID = "UA-100050719-2";

/* TODO: support multiple
const trackingData = [{
  trackingId: BREWLINE_TRACKING_ID,
  gaOptions: {
    name: "Brewline",
    userId: Meteor.userId()
  }
}];
*/
// initialize
// ReactGA.initialize(trackingData);
ReactGA.initialize(BREWLINE_TRACKING_ID);

// on page load & transition
Router.Hooks.onEnter(() => {
  ReactGA.pageview(window.location.pathname + window.location.search);
});

// update userId on login
Accounts.onLogin(() => {
  ReactGA.set({ userId: Meteor.userId() });
});

// on modal open: ReactGA.modalview('/about/contact-us');
// events: ReactGA.event({
//   category: "Social",
//   action: "Rated an App",
//   value: 3,
//   label: ""
// });
