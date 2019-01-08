import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @file Hydra Oauth plugin
 *
 * @namespace HydraOauth
 */

Reaction.registerPackage({
  label: "HydraOauth",
  name: "reaction-hydra-oauth",
  autoEnable: true,
  registry: [{
    route: "/account/login",
    name: "account/login",
    label: "OAuth Login",
    meta: {
      noAdminControls: true,
      oauthLoginFlow: true
    },
    description: "Oauth Login Provider Page",
    workflow: "hydraOauthLogin",
    template: "hydraOauthLoginForm"
  }],
  layout: [{
    layout: "hydraOauthLogin",
    workflow: "hydraOauthLogin",
    theme: "default",
    enabled: true,
    structure: {
      layout: "hydraOauthLogin",
      layoutHeader: "",
      layoutFooter: "",
      notFound: "notFound"
    }
  }]
});
