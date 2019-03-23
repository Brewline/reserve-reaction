import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import reconcileCartsMerge from "./reconcileCartsMerge";

jest.mock("../util/addCartItems", () => jest.fn().mockImplementation(() => Promise.resolve({
  incorrectPriceFailures: [],
  minOrderQuantityFailures: [],
  updatedItemList: [
    {
      _id: "CartItemID",
      addedAt: new Date("2018-01-01T00:00:00.000"),
      createdAt: new Date("2018-01-01T00:00:00.000"),
      productId: "productId",
      quantity: 1,
      shopId: "shopId",
      title: "UPDATED TITLE",
      updatedAt: new Date("2018-01-01T00:00:00.000"),
      variantId: "variantId",
      price: {
        amount: 9.99,
        currencyCode: "USD"
      },
      priceWhenAdded: {
        amount: 9.99,
        currencyCode: "USD"
      },
      subtotal: {
        amount: 9.99,
        currencyCode: "USD"
      }
    }
  ]
})));

const { collections } = mockContext;
const { Cart } = collections;
const accountId = "accountId";
const accountCart = { _id: "ACCOUNT_CART", accountId };
const accountCartSelector = { accountId };
const anonymousCartSelector = { _id: "123" };
const items = [Factory.CartItem.makeOne()];

test("merges anonymous cart items into account cart items, deletes anonymous cart, and returns updated account cart", async () => {
  const updatedItems = [
    {
      _id: "CartItemID",
      addedAt: new Date("2018-01-01T00:00:00.000"),
      createdAt: new Date("2018-01-01T00:00:00.000"),
      productId: "productId",
      quantity: 1,
      shopId: "shopId",
      // We can tell by the title that addCartItems was called
      title: "UPDATED TITLE",
      updatedAt: new Date("2018-01-01T00:00:00.000"),
      variantId: "variantId",
      price: {
        amount: 9.99,
        currencyCode: "USD"
      },
      priceWhenAdded: {
        amount: 9.99,
        currencyCode: "USD"
      },
      subtotal: {
        amount: 9.99,
        currencyCode: "USD"
      }
    }
  ];

  const result = await reconcileCartsMerge({
    accountCart,
    accountCartSelector,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    context: mockContext
  });

  expect(Cart.deleteOne).toHaveBeenCalledWith(anonymousCartSelector);

  expect(Cart.updateOne).toHaveBeenCalledWith(accountCartSelector, {
    $set: {
      items: updatedItems,
      updatedAt: jasmine.any(Date)
    }
  });

  expect(result).toEqual({
    ...accountCart,
    items: updatedItems,
    updatedAt: jasmine.any(Date)
  });
});

test("throws if deleteOne fails", async () => {
  Cart.deleteOne.mockReturnValueOnce(Promise.resolve({ deletedCount: 0 }));

  const promise = reconcileCartsMerge({
    accountCart,
    accountCartSelector,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    context: mockContext
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if updateOne fails", async () => {
  Cart.updateOne.mockReturnValueOnce(Promise.resolve({ modifiedCount: 0 }));

  const promise = reconcileCartsMerge({
    accountCart,
    accountCartSelector,
    anonymousCart: {
      items
    },
    anonymousCartSelector,
    context: mockContext
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});
