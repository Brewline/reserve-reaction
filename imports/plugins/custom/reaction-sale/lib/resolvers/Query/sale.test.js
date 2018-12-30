import sale from "./sale";

const fakeShopId = "W64ZQe9RUMuAoKrli";
const fakeSaleId = "abc123";
const fakeSlug = "reaction";

const fakeSale = {
  _id: fakeSaleId,
  shopId: fakeShopId,
  name: "Reaction",
  slug: fakeSlug
};

test("calls queries.sale and returns the requested sale for a given id", async () => {
  const promise = Promise.resolve(fakeSale);
  const saleMock =
    jest.fn().mockName("queries.sale").mockReturnValueOnce(promise);
  const queries = { sale: saleMock };
  const saleObject = await sale(null, { slugOrId: fakeSaleId }, { queries });

  expect(saleMock).toHaveBeenCalled();
  expect(saleObject).toEqual(fakeSale);
});

test("calls queries.sale and returns the requested sale for a given slug", async () => {
  const promise = Promise.resolve(fakeSale);
  const saleMock =
    jest.fn().mockName("queries.sale").mockReturnValueOnce(promise);
  const queries = { sale: saleMock };
  const saleObject = await sale(null, { slugOrId: fakeSlug }, { queries });

  expect(saleMock).toHaveBeenCalled();
  expect(saleObject).toEqual(fakeSale);
});
