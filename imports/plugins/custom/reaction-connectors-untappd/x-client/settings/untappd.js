import { Template } from "meteor/templating";
import "./untappd-connector.html";
import "./untappd-marketplace-shops.html";
import "./untappd-connector-import-container";
import "./untappd-marketplace-shops-container";
import { Components } from "@reactioncommerce/reaction-components";

Template.untappdConnectSettings.helpers({
  untappdConnectSettingsProps() {
    return { component: Components.UntappdConnectorImport };
  }
});

Template.untappdMarketplaceShops.helpers({
  untappdMarketplaceShopsProps() {
    return { component: Components.UntappdMarketplaceShops };
  }
});
