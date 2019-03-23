
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import removeTag from "./removeTag";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls Mutation.removeTag and returns the RemoveTagPayload on success", async () => {
  const shopId = encodeShopOpaqueId("s1");
  const tagId = encodeTagOpaqueId("t1");
  const tag = {
    name: "shirt",
    displayTitle: "Shirt"
  };

  const fakeResult = { _id: tagId, shopId, ...tag };
  const mockMutation = jest.fn().mockName("mutations.addTag");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));

  const context = {
    mutations: {
      removeTag: mockMutation
    }
  };

  const result = await removeTag(null, {
    input: {
      shopId,
      tagId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    tag: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
