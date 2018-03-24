import "../lib/collections/schemas/products";
import "./product-variant/variant-form-container";
import "./product-detail-simple/product-detail-container";
import "./add-to-cart-button/add-to-cart-button-component"; // no container here

import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { Schemas, registerSchema } from "/imports/plugins/core/collections";
import { ProductVariantLimits } from "../lib/collections/schemas/products";

// In order for the updated schema to be reflected in our client-side code,
// we must register the new schema in place of the old.
// mash together the ProductVariant Schema, and layer in our limits fields
const schemas =
  _.extend({}, Schemas.ProductVariant.schema(), ProductVariantLimits.schema());

registerSchema("ProductVariant", new SimpleSchema(schemas));
