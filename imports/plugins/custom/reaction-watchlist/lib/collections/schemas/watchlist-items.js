import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue, updatedAtAutoValue } from "/imports/collections/schemas/helpers";

/**
 * @name WatchlistItem
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} _id Watchlist Item Id
 * @property {String} shopId Shop Id (the jury is still out on this one)
 * this value is probably ignored, but it would be hard to get back if not
 * captured on document creation
 * @property {String} watchlist use this field for any watchlist specific to
 * your project. examples: Products, Shops, Users
 * @property {String} itemId a foreign key
 * @property {Object} itemMetadata assuming this watchlistItem is sourced by a
 * a third party, metadata holds the resource found using itemId
 * @property {String} displayName name used for display purposes
 * @property {Boolean} isDeleted default value: `false`
 * @property {Boolean} isVisible default value: `false`
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 */
export const WatchlistItem = new SimpleSchema({
  _id: {
    type: String,
    label: "WatchlistItem Id",
    optional: true
  },
  userId: {
    type: String,
    index: true
  },
  shopId: {
    type: String,
    index: true,
    label: "ShopId"
  },
  watchlist: {
    type: String,
    index: true,
    label: "Watchlist Type"
  },
  itemId: {
    type: String,
    index: true,
    label: "itemId (from source data)"
  },
  itemMetadata: {
    type: Object,
    optional: true,
    blackbox: true
  },
  displayName: {
    type: String,
    defaultValue: "",
    label: "Watchlist Item Display Name"
  },
  label: {
    type: String,
    defaultValue: "",
    label: "Label (image or icon)"
  },
  isDeleted: {
    type: Boolean,
    index: true,
    defaultValue: false
  },
  isVisible: {
    type: Boolean,
    index: true,
    defaultValue: true
  },
  createdAt: {
    type: Date,
    autoValue: createdAtAutoValue,
    index: true
  },
  updatedAt: {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  }
});

registerSchema("WatchlistItem", WatchlistItem);
