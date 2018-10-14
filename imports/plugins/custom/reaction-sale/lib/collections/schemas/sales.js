import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import {
  createdAtAutoValue,
  updatedAtAutoValue,
  schemaIdAutoValue
} from "/imports/collections/schemas/helpers";

/**
 * @name Sale
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} _id Sale Id
 * @property {String} shopId Shop Id
 * @property {String} headline or title
 * @property {String} description
 * @property {String} instructions message shown to customers once purchase is
 * complete. this would typically include details about picking up products on
 * site, or what they customer can expect next
 * @property {Date} beginsAt required
 * @property {Date} endsAt required
 * @property {String} mediaId optional
 * @property {String} bannerMediaId optional
 * @property {Boolean} isDemo (false) Allows us to load some Can Releases
 * without actually running them.
 * @property {Boolean} isDeleted default value: `false`
 * @property {Boolean} isVisible default value: `false`
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 */
export const Sale = new SimpleSchema({
  _id: {
    type: String,
    label: "Sale Id",
    optional: true,
    autoValue: schemaIdAutoValue
  },
  shopId: {
    type: String,
    index: true,
    label: "ShopId"
  },
  headline: {
    type: String,
    defaultValue: "",
    label: "Headline"
  },
  slug: {
    type: String,
    index: true,
    label: "URL Slug"
    // TODO: unique per-shop
    // , unique: true
  },
  description: {
    type: String,
    defaultValue: "",
    label: "Description",
    optional: true
  },
  instructions: {
    type: String,
    defaultValue: "",
    label: "Instructions",
    optional: true
  },
  beginsAt: {
    type: Date,
    label: "Sale Begins At"
  },
  endsAt: {
    type: Date,
    label: "Sale Ends At"
  },
  mediaId: {
    type: String,
    optional: true
  },
  bannerMediaId: {
    type: String,
    optional: true
  },
  changedSlugWas: {
    type: String,
    optional: true
  },
  isDemo: {
    type: Boolean,
    label: "Demo Flag",
    defaultValue: false
  },
  isVisible: {
    type: Boolean,
    index: true,
    defaultValue: true
  },
  createdAt: {
    type: Date,
    autoValue: createdAtAutoValue
  },
  updatedAt: {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  },
  deletedAt: {
    type: Date,
    optional: true
  }
});

registerSchema("Sale", Sale);
