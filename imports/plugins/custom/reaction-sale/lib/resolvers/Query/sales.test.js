import salesResolver from "./sales";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopId = opaqueShopId;

const mockSales = [
  { _id: "a1", title: "Item 1" },
  { _id: "b2", title: "Item 2" },
  { _id: "c3", title: "Item 3" }
];

const mockSalesQuery = getFakeMongoCursor("Sales", mockSales);

test("calls queries.sales and returns a partial connection", async (done) => {
  const sales = jest.fn()
    .mockName("queries.sales")
    .mockReturnValueOnce(Promise.resolve(mockSalesQuery));

  const result = await salesResolver({}, {
    shopId
  }, {
    queries: { sales }
  });

  expect(result).toEqual({
    nodes: mockSales,
    pageInfo: {
      endCursor: "c3",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "a1"
    },
    totalCount: 3
  });

  expect(sales).toHaveBeenCalled();
  expect(sales.mock.calls[0][1]).toEqual({
    shopId: ["123"]
  });

  done();
});
