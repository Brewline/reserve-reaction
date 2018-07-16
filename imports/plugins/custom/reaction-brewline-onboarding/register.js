import { Reaction } from "/server/api";
import { BrowserPolicy } from "meteor/browser-policy-common";

let breweryStep = 0;

Reaction.registerPackage({
  label: "Brewline Onboarding",
  name: "reaction-brewline-onboarding",
  autoEnable: true,
  registry: [{
    name: "brewlineOnboardingBrewery",
    layout: "onboardingLayout",
    route: "/welcome/brewery/:step?",
    template: "BrewlineOnboarding",
    workflow: "onboardingBrewery"
  }, {
    name: "brewlineOnboardingConsumer",
    layout: "onboardingLayout",
    route: "/welcome/customer/:step?",
    template: "BrewlineOnboarding",
    workflow: "onboardingCustomer"
  }],
  layout: [{
    layout: "onboardingLayout",
    workflow: "onboardingBrewery",
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
    label: "Find your Brewery",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBreweryLogin",
    path: "login",
    label: "Login",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBrewerySearch",
    path: "search",
    label: "Find your Brewery",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBreweryProducts",
    path: "products",
    label: "Choose Products",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBreweryWhatsNext",
    path: "whats-next",
    label: "What's Next?",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }]
});

BrowserPolicy.content.allowOriginForAll("*.brewline.io");
BrowserPolicy.content.allowOriginForAll("brewline.s3.amazonaws.com");
