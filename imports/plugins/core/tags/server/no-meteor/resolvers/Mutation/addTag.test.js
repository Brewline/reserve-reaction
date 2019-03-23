import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import addTag from "./addTag";

beforeEach(() => {
  jest.resetAllMocks();
});

test("calls Mutation.addTag and returns the AddTagPayload on success", async () => {
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
      addTag: mockMutation
    }
  };

  const result = await addTag(null, {
    input: {
      ...tag,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    tag: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
