import mockContext from "/imports/test-utils/helpers/mockContext";
import buildContext from "./buildContext";

const fakeUser = {
  _id: "FAKE_BUILD_CONTEXT_USER_ID"
};

test("properly mutates the context object without user", async () => {
  const context = { collections: mockContext.collections };
  await buildContext(context, undefined);
  expect(context).toEqual({
    collections: mockContext.collections,
    shopId: null,
    user: null,
    userHasPermission: jasmine.any(Function),
    userId: null
  });
});

test("properly mutates the context object with user", async () => {
  const context = { collections: mockContext.collections };
  await buildContext(context, fakeUser);
  expect(context).toEqual({
    collections: mockContext.collections,
    shopId: null,
    user: fakeUser,
    userHasPermission: jasmine.any(Function),
    userId: fakeUser._id
  });

  // Make sure the hasPermission currying works with one arg
  const result1 = await context.userHasPermission(["foo"]);
  expect(result1).toBe(false);

  // Make sure the hasPermission currying works with two args
  const result2 = await context.userHasPermission(["foo"], "scope");
  expect(result2).toBe(false);
});
