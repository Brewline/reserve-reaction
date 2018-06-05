import tagsResolver from "./tags";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockTags = [
  { _id: "a1", name: "Men" },
  { _id: "b2", name: "Women" },
  { _id: "c3", name: "Children" }
];

const mockTagsQuery = getFakeMongoCursor("Tags", mockTags);

test("calls queries.tags and returns a partial connection", async () => {
  const tags = jest.fn().mockName("queries.tags").mockReturnValueOnce(Promise.resolve(mockTagsQuery));

  const result = await tagsResolver({}, { shopId: base64ID }, {
    queries: { tags }
  });

  expect(result).toEqual({
    nodes: mockTags,
    pageInfo: {
      endCursor: "c3",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "a1"
    },
    totalCount: 3
  });

  expect(tags).toHaveBeenCalled();
  expect(tags.mock.calls[0][1]).toBe("123");
});
