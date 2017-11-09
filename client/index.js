import "../lib/collections/schemas/products";
import "./product-variant/variant-form-container-decorator";
import "./product-detail-simple/product-detail-container-decorator";

import _ from "lodash";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Schemas, registerSchema } from "@reactioncommerce/reaction-collections";
import { ProductVariantLimits } from "../lib/collections/schemas/products";

// In order for the updated schema to be reflected in our client-side code,
// we must register the new schema in place of the old.
// mash together the ProductVariant Schema, and layer in our limits fields
const schemas =
  _.extend({}, Schemas.ProductVariant.schema(), ProductVariantLimits.schema());

registerSchema("ProductVariant", new SimpleSchema(schemas));
