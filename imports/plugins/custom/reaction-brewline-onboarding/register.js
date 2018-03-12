import { Reaction } from "/server/api";

let breweryStep = 0;

Reaction.registerPackage({
  label: "Brewline Onboarding",
  name: "reaction-brewline-onboarding",
  autoEnable: true,
  registry: [{
    name: "brewlineOnboardingBrewery",
    route: "/welcome/brewery",
    template: "brewlineOnboarding",
    workflow: "onboardingBrewery"
  }, {
    name: "brewlineOnboardingConsumer",
    route: "/welcome/customer",
    template: "brewlineOnboarding",
    workflow: "onboardingCustomer"
  }],
  layout: [{
    layout: "coreLayout",
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
    label: "Find your Brewery",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBreweryLogin",
    label: "Login",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBrewerySearch",
    label: "Find your Brewery",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBreweryProducts",
    label: "Choose Products",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }, {
    template: "OnboardingBreweryWhatsNext",
    label: "What's Next?",
    workflow: "onboardingBrewery",
    container: "brewline-onboarding-main",
    // audience: ["guest", "anonymous"],
    position: String(++breweryStep)
  }]
});

BrowserPolicy.content.allowOriginForAll("*.brewline.io");
BrowserPolicy.content.allowOriginForAll("brewline.s3.amazonaws.com");
