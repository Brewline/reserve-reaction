const mockContext = {
  collections: {},
  shopId: "FAKE_SHOP_ID",
  userHasPermission: jest.fn().mockName("userHasPermission"),
  userId: "FAKE_USER_ID"
};

[
  "Accounts",
  "Assets",
  "Cart",
  "Catalog",
  "Emails",
  "Groups",
  "Inventory",
  "Logs",
  "MediaRecords",
  "Notifications",
  "Orders",
  "Packages",
  "Products",
  "Revisions",
  "roles",
  "SellerShops",
  "Shipping",
  "Shops",
  "Sms",
  "Tags",
  "Templates",
  "Themes",
  "Translations",
  "users"
].forEach((collectionName) => {
  mockContext.collections[collectionName] = {
    insert() {
      throw new Error("insert mongo method is deprecated, use insertOne or insertMany");
    },
    remove() {
      throw new Error("remove mongo method is deprecated, use deleteOne or deleteMany");
    },
    update() {
      throw new Error("update mongo method is deprecated, use updateOne or updateMany");
    },
    deleteOne: jest.fn().mockName(`${collectionName}.deleteOne`),
    deleteMany: jest.fn().mockName(`${collectionName}.deleteMany`),
    find: jest
      .fn()
      .mockName(`${collectionName}.find`)
      .mockReturnThis(),
    findOne: jest.fn().mockName(`${collectionName}.findOne`),
    insertOne: jest.fn().mockName(`${collectionName}.insertOne`),
    insertMany: jest.fn().mockName(`${collectionName}.insertMany`),
    toArray: jest.fn().mockName(`${collectionName}.toArray`),
    updateOne: jest.fn().mockName(`${collectionName}.updateOne`),
    updateMany: jest.fn().mockName(`${collectionName}.updateMany`)
  };
});

mockContext.collections.Media = {
  find: jest.fn().mockName("Media.find"),
  findLocal: jest.fn().mockName("Media.findLocal"),
  findOne: jest.fn().mockName("Media.findOne"),
  findOneLocal: jest.fn().mockName("Media.findOneLocal"),
  insert: jest.fn().mockName("Media.insert"),
  update: jest.fn().mockName("Media.update"),
  remove: jest.fn().mockName("Media.remove")
};

export default mockContext;
