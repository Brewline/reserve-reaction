import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import {
  assocInternalId,
  assocOpaqueId,
  decodeOpaqueIdForNamespace,
  encodeOpaqueId
} from "@reactioncommerce/reaction-graphql-xforms/id";

namespaces.Sale = "reaction/sale";

export const assocSaleInternalId = assocInternalId(namespaces.Sale);
export const assocSaleOpaqueId = assocOpaqueId(namespaces.Sale);
export const decodeSaleOpaqueId = decodeOpaqueIdForNamespace(namespaces.Sale);
export const encodeSaleOpaqueId = encodeOpaqueId(namespaces.Sale);
