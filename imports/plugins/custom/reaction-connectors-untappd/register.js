import { BrowserPolicy } from "meteor/browser-policy-common";
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Untappd Connect",
  name: "reaction-connectors-untappd",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {
    apiKey: "",
    password: "",
    sharedSecret: "",
    shopName: "",
    webhooks: []
  },
  registry: [{
    label: "Untappd Connect Settings",
    name: "settings/connectors/untappd",
    icon: "fa fa-exchange",
    route: "/dashboard/connectors/untappd",
    provides: ["connectorSettings"],
    container: "dashboard",
    template: "untappdConnectSettings"
  }]
});

BrowserPolicy.content.allowOriginForAll("*.akamaized.net");
