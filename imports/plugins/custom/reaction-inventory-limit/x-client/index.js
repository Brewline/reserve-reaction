import "./product-variant/variant-form-container";
import "./product-detail-simple/product-detail-container";
import "./add-to-cart-button/add-to-cart-button-component"; // no container here

import { ProductVariant } from "/lib/collections/schemas";
import { ProductVariantLimits } from "../lib/collections/schemas/products";

ProductVariant.extend(ProductVariantLimits);
