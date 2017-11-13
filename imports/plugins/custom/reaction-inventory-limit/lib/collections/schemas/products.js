import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Products } from "/lib/collections";

export const ProductVariantLimits = new SimpleSchema({
  inventoryLimit: {
    type: Number,
    optional: true,
    decimal: false,
    label: "Maximum number of items that may be purchased"
  }
});

Products.attachSchema(ProductVariantLimits, { selector: { type: "simple" } });
Products.attachSchema(ProductVariantLimits, { selector: { type: "variant" } });
