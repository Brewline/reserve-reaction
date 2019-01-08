import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import { encodeSaleOpaqueId as encodeOpaqueId } from "../../xforms/sale";
import saleProducts from "./saleProducts";

export default {
  _id: (node) => encodeOpaqueId(node._id),
  shop: resolveShopFromShopId,
  products: saleProducts,

  // meta data
  isLowQuantity: (node) => {
    if (!node.products) { return null; }

    return node.products.some((p) => p.isSoldOut);
  },

  isBackorder: (node) => {
    if (!node.products) { return null; }

    return node.products.some((p) => p.isSoldOut);
  },

  isSoldOut: (node) => {
    if (!node.products) { return null; }

    return node.products.every((p) => p.isSoldOut);
  },

  hasNotBegun: (node) => node.beginsAt > new Date(),

  hasEnded: (node) => node.endsAt < new Date()
};
