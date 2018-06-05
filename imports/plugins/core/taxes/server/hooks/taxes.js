import { Meteor } from "meteor/meteor";
import { Hooks } from "/server/api";

/**
 * After cart update apply taxes.
 * if items are changed, recalculating taxes
 * we could have done this in the core/cart transform
 * but this way this file controls the events from
 * the core/taxes plugin.
 * @private
 */
Hooks.Events.add("afterCartUpdateCalculateTaxes", (cartId) => {
  Meteor.call("taxes/calculate", cartId);
});
