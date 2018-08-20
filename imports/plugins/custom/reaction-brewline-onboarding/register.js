import { Reaction } from "/server/api";
import { BrowserPolicy } from "meteor/browser-policy-common";

let breweryStep = 0;
let customerStep = 0;

const onboardingWorkflow = "onboarding";
const breweryWorkflow = "onboardingBrewery";
const customerWorkflow = "onboardingCustomer";

Reaction.registerPackage({
  label: "Brewline Onboarding",
  name: "reaction-brewline-onboarding",
  autoEnable: true,
  registry: [{
    name: "brewlineOnboarding",
    layout: "onboardingLayout",
    route: "/welcome",
    template: "BrewlineOnboarding",
    workflow: onboardingWorkflow
  }, {
    name: "brewlineOnboardingBrewery",
    layout: "onboardingLayout",
    route: "/welcome/brewery/:step?",
    template: "BrewlineOnboarding",
    workflow: breweryWorkflow
  }, {
    name: "brewlineOnboardingCustomer",
    layout: "onboardingLayout",
    route: "/welcome/customer/:step?",
    template: "BrewlineOnboarding",
    workflow: customerWorkflow
  }],
  layout: [{
    layout: "onboardingLayout",
    workflow: onboardingWorkflow,
    collection: "Accounts",
    theme: "default",
    enabled: true,
    structure: {
      template: "brewlineOnboarding",
      layoutHeader: "OnboardingNavBar",
      layoutFooter: "Footer",
      notFound: "notFound",
      dashboardControls: "",
      adminControlsFooter: "",
      dashboardHeaderControls: ""
    }
  }, {
    template: "OnboardingAbout",
    path: "about",
    label: "About Brewline",
    workflow: onboardingWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: 1
  }, {
    layout: "onboardingLayout",
    workflow: breweryWorkflow,
    collection: "Accounts",
    theme: "default",
    enabled: true,
    structure: {
      template: "brewlineOnboarding",
      layoutHeader: "OnboardingNavBar",
      layoutFooter: "Footer",
      notFound: "notFound",
      dashboardControls: "",
      adminControlsFooter: "",
      dashboardHeaderControls: ""
    }
  }, {
    template: "OnboardingBreweryAbout",
    path: "about",
    label: "About Brewline",
    workflow: breweryWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep),
    meta: {
      title: "Welcome Brewers - About Brewline"
    }
  }, {
    template: "OnboardingBreweryLogin",
    path: "login",
    label: "Login",
    workflow: breweryWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep),
    meta: {
      title: "Welcome Brewers - Login"
    }
  }, {
    template: "OnboardingBrewerySearch",
    path: "search",
    label: "Find your Brewery",
    workflow: breweryWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep),
    meta: {
      title: "Welcome Brewers - Search"
    }
  }, {
    template: "OnboardingBreweryProducts",
    path: "products",
    label: "Choose Products",
    workflow: breweryWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep),
    meta: {
      title: "Welcome Brewers - Find Your Beers"
    }
  }, {
    template: "OnboardingBreweryWhatsNext",
    path: "whats-next",
    label: "What's Next?",
    workflow: breweryWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep),
    meta: {
      title: "Welcome Brewers - What You Can Expect"
    }
  }, {
    layout: "onboardingLayout",
    workflow: customerWorkflow,
    collection: "Accounts",
    theme: "default",
    enabled: true,
    structure: {
      template: "brewlineOnboarding",
      layoutHeader: "OnboardingNavBar",
      layoutFooter: "Footer",
      notFound: "notFound",
      dashboardControls: "",
      adminControlsFooter: "",
      dashboardHeaderControls: ""
    }
  }, {
    template: "OnboardingCustomerAbout",
    path: "about",
    label: "About Brewline",
    workflow: customerWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++customerStep),
    meta: {
      title: "Welcome Beer Drinkers - About Brewline"
    }
  }, {
    template: "OnboardingCustomerSearch",
    path: "search",
    label: "Find your Favorite Brewery",
    workflow: customerWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++customerStep),
    meta: {
      title: "Welcome Beer Drinkers - Favorite Brewers"
    }
  }, {
    template: "OnboardingCustomerThankYou",
    path: "thank-you",
    label: "Thank You!",
    workflow: customerWorkflow,
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++customerStep),
    meta: {
      title: "Welcome Beer Drinkers - Thank You"
    }
  }]
});

BrowserPolicy.content.allowOriginForAll("*.brewline.io");
BrowserPolicy.content.allowOriginForAll("brewline.s3.amazonaws.com");
