import mockContext from "/imports/test-utils/helpers/mockContext";
import { NavigationItem as NavigationItemSchema } from "/imports/collections/schemas";
import deleteNavigationItemMutation from "./deleteNavigationItem";

const mockNavigationItem = {
  _id: "n1",
  createdAt: new Date(),
  metadata: { tagId: "t1" },
  draftData: {
    content: [
      {
        language: "en",
        value: "Home"
      }
    ],
    isUrlRelative: true,
    shouldOpenInNewWindow: false,
    url: "/",
    classNames: "home-link"
  }
};

test("calls NavigationItems.deleteOne and returns an object that validates against the schema", async () => {
  mockContext.collections.NavigationItems.findOne.mockReturnValueOnce(Promise.resolve(mockNavigationItem));
  const navigationItem = await deleteNavigationItemMutation(mockContext, {});
  const validationContext = NavigationItemSchema.newContext();
  validationContext.validate(navigationItem);
  const isValid = validationContext.isValid();

  expect(isValid).toBe(true);
  expect(mockContext.collections.NavigationItems.deleteOne).toHaveBeenCalled();
});

test("throws an error if the user does not have the core permission", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  const result = deleteNavigationItemMutation(mockContext, { _id: "n1" });
  expect(result).rejects.toThrow();
});

test("throws an error if the navigation item does not exist", async () => {
  mockContext.collections.NavigationItems.findOne.mockReturnValueOnce(null);
  const result = deleteNavigationItemMutation(mockContext, { _id: "n1" });
  expect(result).rejects.toThrow();
});
