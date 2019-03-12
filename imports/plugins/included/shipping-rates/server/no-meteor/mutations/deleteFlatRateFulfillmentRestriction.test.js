import mockContext, { mockCollection } from "/imports/test-utils/helpers/mockContext";
import deleteFlatRateFulfillmentRestrictionMutation from "./deleteFlatRateFulfillmentRestriction";


// Create mock context with FlatRateFulfillmentRestrictions collection
mockContext.collections.FlatRateFulfillmentRestrictions = mockCollection("FlatRateFulfillmentRestrictions");
mockContext.userHasPermission.mockReturnValueOnce(true);

const value = {
  type: "deny",
  attributes: [
    { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
    { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
  ],
  destination: { region: ["CO", "NY"] }
};

test("delete a flat rate fulfillment restriction", async () => {
  mockContext.collections.FlatRateFulfillmentRestrictions.findOneAndDelete.mockReturnValueOnce(Promise.resolve({
    ok: 1,
    value
  }));

  const result = await deleteFlatRateFulfillmentRestrictionMutation(mockContext, {
    restrictionId: "restriction123",
    shopId: "shop123"
  });

  expect(result).toEqual({
    restriction: {
      type: "deny",
      attributes: [
        { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
        { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
      ],
      destination: { region: ["CO", "NY"] }
    }
  });
});
