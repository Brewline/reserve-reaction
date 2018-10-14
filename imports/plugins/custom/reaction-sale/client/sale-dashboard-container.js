import { Meteor } from "meteor/meteor";
import {
  composeWithTracker,
  registerComponent
} from "@reactioncommerce/reaction-components";
import { Sales } from "../lib/collections";

import SaleDashboard from "./sale-dashboard-component";

function composer(props, onData) {
  // listen for Can Releases (Sales)
  let sales;
  const salesSubscription = Meteor.subscribe("Sales");

  if (salesSubscription.ready()) {
    sales = Sales.find({}).fetch();
  }

  onData(null, {
    ...props,
    sales
  });
}

registerComponent(
  "SaleDashboard",
  SaleDashboard,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(SaleDashboard);
