import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import { encodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import TestApp from "../TestApp";
import GroupsFullQuery from "./GroupsFullQuery.graphql";
import Factory from "/imports/test-utils/helpers/factory";

jest.setTimeout(300000);

/**
 * @param {Object} mongoGroup The Group document in MongoDB schema
 * @return {Object} The Group document in GraphQL schema
 */
function groupMongoSchemaToGraphQL(mongoGroup) {
  const doc = {
    ...mongoGroup,
    _id: encodeGroupOpaqueId(mongoGroup._id),
    createdAt: mongoGroup.createdAt.toISOString(),
    createdBy: {
      _id: encodeAccountOpaqueId(mongoGroup.createdBy)
    },
    updatedAt: mongoGroup.updatedAt.toISOString()
  };
  delete doc.shopId;
  return doc;
}

let testApp;
let groupsQuery;
let mockAdminAccount;
let mockOtherAccount;
let opaqueShopId;
let groups;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  const shopId = await testApp.insertPrimaryShop();
  opaqueShopId = encodeShopOpaqueId(shopId);

  mockAdminAccount = Factory.Accounts.makeOne({
    roles: {
      [shopId]: ["reaction-accounts"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  groups = Factory.Groups.makeMany(3, { shopId });
  await testApp.collections.Groups.insertMany(groups);

  mockOtherAccount = Factory.Accounts.makeOne({
    groups: [groups[0]._id],
    shopId
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  await testApp.collections.Groups.updateMany({}, {
    $set: {
      createdBy: mockOtherAccount._id
    }
  });

  for (let index = 0; index < groups.length; index += 1) {
    groups[index].createdBy = mockOtherAccount._id;
  }

  groupsQuery = testApp.query(GroupsFullQuery);
});

afterAll(() => testApp.stop());

test.skip("unauthenticated", async () => {
  try {
    await groupsQuery({ shopId: opaqueShopId });
  } catch (error) {
    expect(error[0].message).toBe("User does not have permissions to view groups");
  }
});

test.skip("authenticated with reaction-accounts role, gets all groups", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const nodes = groups.map(groupMongoSchemaToGraphQL);

  // Default sortBy is createdAt ascending
  nodes.sort((item1, item2) => {
    if (item1.createdAt > item2.createdAt) return 1;
    if (item1.createdAt < item2.createdAt) return -1;
    return 0;
  });

  const result = await groupsQuery({ shopId: opaqueShopId });
  expect(result).toEqual({
    groups: {
      nodes
    }
  });

  await testApp.clearLoggedInUser();
});

test.skip("authenticated without reaction-accounts role, gets only groups the account belongs to", async () => {
  await testApp.setLoggedInUser(mockOtherAccount);

  const nodes = groups.slice(0, 1).map(groupMongoSchemaToGraphQL);

  // Default sortBy is createdAt ascending
  nodes.sort((item1, item2) => {
    if (item1.createdAt > item2.createdAt) return 1;
    if (item1.createdAt < item2.createdAt) return -1;
    return 0;
  });

  const result = await groupsQuery({ shopId: opaqueShopId });
  expect(result).toEqual({
    groups: {
      nodes
    }
  });

  await testApp.clearLoggedInUser();
});
