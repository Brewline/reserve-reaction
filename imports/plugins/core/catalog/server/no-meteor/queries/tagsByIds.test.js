import mockContext from "/imports/test-utils/helpers/mockContext";
import tagsByIds from "./tagsByIds";

const mockTagIds = ["ID_ONE", "ID_TWO"];

beforeEach(() => {
  jest.resetAllMocks();
});

test("default", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tagsByIds(mockContext, mockTagIds);
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ _id: { $in: mockTagIds }, isDeleted: { $ne: true } });
  expect(result).toBe("CURSOR");
});

test("include deleted", async () => {
  mockContext.collections.Tags.find.mockReturnValueOnce("CURSOR");
  const result = await tagsByIds(mockContext, mockTagIds, { shouldIncludeDeleted: true });
  expect(mockContext.collections.Tags.find).toHaveBeenCalledWith({ _id: { $in: mockTagIds } });
  expect(result).toBe("CURSOR");
});
