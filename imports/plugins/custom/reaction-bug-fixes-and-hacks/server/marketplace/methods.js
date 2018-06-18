import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

// I'm not sure this was removed on purpose:
// https://github.com/reactioncommerce/reaction/commit/1c8728f98964766264bec5c412f781b936eaf537#diff-23ae3525cb0c51592cf2f07a636dd323
Meteor.methods({
  "marketplace/updateShopDetails"(doc, _id) {
    check(_id, String);
    check(doc, Object);

    if (!Reaction.hasPermission("admin", this.userId, Reaction.getSellerShopId(this.userId))) {
      return;
    }

    Shops.update(_id, doc, (error) => {
      if (error) {
        throw new Meteor.Error(500, error.message);
      }
    });
  }
});
