import ReactionError from "@reactioncommerce/reaction-error";

const findOneMock = jest.fn().mockName("Meteor.users.rawCollection().findOne");

export const Meteor = {
  apply: jest.fn().mockName("Meteor.apply"),
  call: jest.fn().mockName("Meteor.call"),
  Error: ReactionError,
  isClient: false,
  isServer: true,
  methods: jest.fn().mockName("Meteor.methods"),
  settings: {
    public: {}
  },
  users: {
    rawCollection: () => ({
      findOne: findOneMock
    })
  }
};
