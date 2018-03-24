import SimpleSchema from "simpl-schema";
import { Products } from "/lib/collections";

export const ProductVariantLimits = new SimpleSchema({
  inventoryLimit: {
    type: SimpleSchema.Integer,
    optional: true,
    label: "Maximum number of items that may be purchased"
  }
});

Products.attachSchema(ProductVariantLimits, { selector: { type: "simple" } });
Products.attachSchema(ProductVariantLimits, { selector: { type: "variant" } });
