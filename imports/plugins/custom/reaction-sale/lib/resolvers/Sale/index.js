import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import { encodeSaleOpaqueId as encodeOpaqueId } from "../../xforms/sale";
import saleProducts from "./saleProducts";

export default {
  _id: (node) => encodeOpaqueId(node._id),
  shop: resolveShopFromShopId,
  products: saleProducts
};
