import "./sale-detail.html";

import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.saleDetail.helpers({
  component() {
    return Components.SaleDetail;
  }
});
