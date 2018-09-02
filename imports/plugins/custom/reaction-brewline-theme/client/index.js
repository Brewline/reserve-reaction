import ReactGA from "react-ga";
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { Router } from "/client/api";
import { Accounts } from "meteor/accounts-base";
import {
  SocialProvider,
  SocialPackageConfig
} from "/lib/collections/schemas";

import SocialSettings from "@reactioncommerce/reaction-included/social/client/components/settings";

import "./favicon";

function addBodyClass() {
  if (addBodyClass.oneAndDone) { return; }

  document.querySelector("body").setAttribute("data-ready", "true");

  addBodyClass.oneAndDone = true;
}

const AdditionalSocialPackages = new SimpleSchema({
  "settings": SocialPackageConfig._schema.settings,
  "settings.public": SocialPackageConfig._schema["settings.public"],
  "settings.public.apps": SocialPackageConfig._schema["settings.public.apps"],
  "settings.public.apps.instagram": {
    type: SocialProvider,
    optional: true,
    defaultValue: {}
  },
  "settings.public.apps.untappd": {
    type: SocialProvider,
    optional: true,
    defaultValue: {}
  }
});

SocialPackageConfig.extend(AdditionalSocialPackages);

SocialSettings.addProvider({
  name: "instagram",
  icon: "fa fa-instagram",
  fields: ["profilePage"]
});

SocialSettings.addProvider({
  name: "untappd",
  icon: "fa fa-untappd",
  fields: ["profilePage"]
});

SocialSettings.disableProvider("pinterest");
SocialSettings.disableProvider("googleplus");

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
