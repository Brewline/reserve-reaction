import { Template } from "meteor/templating";
import "./untappd.html";
import "./untappd-connector-import-container";
import { Components } from "@reactioncommerce/reaction-components";

Template.untappdConnectSettings.helpers({
  untappdConnectSettingsProps() {
    return { component: Components.UptappdConnectorImport };
  }
});