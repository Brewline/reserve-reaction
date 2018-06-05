import mockContext from "/imports/test-utils/helpers/mockContext";
import { rolesQuery } from "./rolesQuery";

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if userHasPermission returns false", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  await expect(rolesQuery(mockContext)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin"], mockContext.shopId);
});

test("returns roles cursor if user has permission", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.roles.find.mockReturnValueOnce("CURSOR");
  const result = await rolesQuery(mockContext);
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin"], mockContext.shopId);
  expect(mockContext.collections.roles.find).toHaveBeenCalledWith({});
  expect(result).toBe("CURSOR");
});
