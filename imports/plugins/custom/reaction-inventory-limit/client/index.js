import "../lib/collections/schemas/products";
import "./product-variant/variant-form-container";
import "./product-detail-simple/product-detail-container";
import "./add-to-cart-button/add-to-cart-button-component"; // no container here

import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { ProductVariant } from "/lib/collections/schemas/products";
import { ProductVariantLimits } from "../lib/collections/schemas/products";

ProductVariant.extend(ProductVariantLimits);
