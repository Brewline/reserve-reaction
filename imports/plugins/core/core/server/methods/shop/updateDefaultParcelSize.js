import { check, Match } from "meteor/check";
import { Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

const shippingRoles = ["admin", "owner", "shipping"];

/**
 * @method shop/updateDefaultParcelSize
 * @summary update defaultParcelSize for a shop
 * @param {Object} parcel - size to be updated
 * @since 1.1.12
 * @returns {Object} The update call result
*/
export default function updateDefaultParcelSize(parcel) {
  check(parcel, {
    weight: Match.Optional(Number),
    height: Match.Optional(Number),
    length: Match.Optional(Number),
    width: Match.Optional(Number)
  });

  if (!Reaction.hasPermission(shippingRoles)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const modifier = Object.keys(parcel).reduce((mod, key) => {
    mod[`defaultParcelSize.${key}`] = parcel[key];
    return mod;
  }, {});

  return Shops.update({
    _id: Reaction.getShopId()
  }, {
    $set: modifier
  }, (error) => {
    if (error) {
      throw new ReactionError("server-error", error.message);
    }
  });
}
