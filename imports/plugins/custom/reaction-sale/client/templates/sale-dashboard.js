import "./sale-dashboard.html";

import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.saleDashboard.helpers({
  component() {
    return Components.SaleDashboard;
  }
});
