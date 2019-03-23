import "./sale-detail-simple-toolbar.html";

import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.saleDetailSimpleToolbar.helpers({
  component() {
    return Components.SaleDetailSimpleToolbar;
  }
});
