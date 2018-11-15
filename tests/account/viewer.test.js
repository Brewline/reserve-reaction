import TestApp from "../TestApp";
import ViewerFullQuery from "./ViewerFullQuery.graphql";
import Factory from "/imports/test-utils/helpers/factory";

jest.setTimeout(300000);

let testApp;
let viewerQuery;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  viewerQuery = testApp.query(ViewerFullQuery);
});

afterAll(() => testApp.stop());

test.skip("unauthenticated", async () => {
  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: null
  });
});

test.skip("authenticated", async () => {
  const mockAccount = Factory.Accounts.makeOne({
    _id: "123"
  });

  await testApp.setLoggedInUser(mockAccount);

  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: {
      _id: "cmVhY3Rpb24vYWNjb3VudDoxMjM=",
      addressBook: {
        nodes: [
          { address1: "mockAddress1" }
        ]
      },
      createdAt: mockAccount.createdAt.toISOString(),
      currency: null,
      emailRecords: [
        {
          address: mockAccount.emails[0].address,
          verified: mockAccount.emails[0].verified
        }
      ],
      groups: {
        nodes: null
      },
      metafields: [
        {
          description: "mockDescription",
          key: "mockKey",
          namespace: "mockNamespace",
          scope: "mockScope",
          value: "mockValue",
          valueType: "mockValueType"
        }
      ],
      name: "mockName",
      note: "mockNote",
      preferences: {},
      shop: null,
      taxSettings: {
        customerUsageType: "mockCustomerUsageType",
        exemptionNo: "mockExemptionNo"
      },
      updatedAt: mockAccount.updatedAt.toISOString()
    }
  });

  await testApp.clearLoggedInUser();
});
