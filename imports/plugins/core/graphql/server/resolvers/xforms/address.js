import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocAddressInternalId = assocInternalId(namespaces.Address);
export const assocAddressOpaqueId = assocOpaqueId(namespaces.Address);
export const decodeAddressOpaqueId = decodeOpaqueIdForNamespace(namespaces.Address);
export const encodeAddressOpaqueId = encodeOpaqueId(namespaces.Address);
export const xformAddressInput = assocAddressInternalId;
