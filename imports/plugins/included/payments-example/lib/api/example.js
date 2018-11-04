import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import ReactionError from "@reactioncommerce/reaction-error";

export const Example = {
  accountOptions() {
    const { settings } = Packages.findOne({
      name: "reaction-paymentmethod"
    });
    if (!settings.apiKey) {
      throw new ReactionError("invalid-credentials", "Invalid Credentials");
    }
    return settings.apiKey;
  },

  authorize(cardInfo, paymentInfo, callback) {
    Meteor.call("exampleSubmit", "authorize", cardInfo, paymentInfo, callback);
  }
};
