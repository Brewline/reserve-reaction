import mockContext from "/imports/test-utils/helpers/mockContext";
import createSaleForUntappdProduct from "./createSaleForUntappdProduct";

function MockUntappdClient() {
  console.log("UntappdClient!!");
}
MockUntappdClient.prototype.setClientId = () => {};
MockUntappdClient.prototype.setClientSecret = () => {};
MockUntappdClient.prototype.beerInfo = () => {};

jest.mock("node-untappd", () => (
  jest.fn().mockImplementation(() => Promise.resolve(MockUntappdClient))
));

describe("createSaleForUntappdProduct", () => {
  let input;

  beforeEach(() => {
    input = {};
  });

  test.skip("validates inputs", () => {
    expect(async () => {
      await createSaleForUntappdProduct(mockContext, input);
    }).toThrow();
  });

  test.skip("fetches a product from Untappd", () => {});
  test.skip("uses the current shop if a merchant shop", () => {});
  test.skip("creates a shop from Untappd data when on primary shop", () => {});
  test.skip("uses the provided sale (given an encoded saleId)", () => {});
  test.skip("creates a sale when saleId is not provided", () => {});
  test.shop("creates product documents", () => {});
  test.shop("publishes to the catalog", () => {});
});
