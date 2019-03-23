/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import { Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

const code = {
  discount: 12,
  label: "Discount 5",
  description: "Discount by 5%",
  discountMethod: "code",
  code: "promocode"
};

before(function () {
  this.timeout(15000);
});

describe("discount code methods", function () {
  const shop = getShop();
  let sandbox;
  let user;
  let account;
  let accountId;

  before(function () {
    user = Factory.create("user");
    account = Factory.create("account", { userId: user._id });
    accountId = account._id;
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("discounts/addCode", function () {
    it("should throw 403 error with discounts permission", function () {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("discounts/addCode", code)).to.throw(ReactionError, /Access Denied/);
    });

    // admin user
    it("should add code when user has role", function () {
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addCode", code);
      expect(discountInsertSpy).to.have.been.called;

      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(1);
    });
  });

  describe("discounts/deleteCode", function () {
    it("should delete rate with discounts permission", function () {
      this.timeout(15000);
      sandbox.stub(Roles, "userIsInRole", () => true);
      const discountInsertSpy = sandbox.spy(Discounts, "insert");
      const discountId = Meteor.call("discounts/addCode", code);
      expect(discountInsertSpy).to.have.been.called;

      Meteor.call("discounts/deleteCode", discountId);
      const discountCount = Discounts.find(discountId).count();
      expect(discountCount).to.equal(0);
    });
  });

  describe("discounts/codes/apply", function () {
    it("should apply code when called for a cart with multiple items from same shop", function () {
      this.timeout(5000);
      sandbox.stub(Reaction, "getCartShopId", () => shop._id);
      sandbox.stub(Reaction, "getUserId", () => user._id);
      sandbox.stub(Reaction, "hasPermission", () => true);

      // make a cart with two items from same shop
      const cart = Factory.create("cartMultiItems", { accountId });

      Meteor.call("discounts/addCode", code);
      Meteor.call("discounts/codes/apply", cart._id, code.code);

      const updatedCart = Cart.findOne({ _id: cart._id });
      const discountObj = updatedCart.billing.find((billing) => billing.method === "discount");
      const discountStatus = discountObj && discountObj.status;

      expect(discountStatus).to.equal("created");
    });

    it("should not apply code when applied to multi-shop order or cart", function () {
      this.timeout(5000);
      sandbox.stub(Reaction, "getCartShopId", () => shop._id);
      sandbox.stub(Reaction, "getUserId", () => user._id);
      sandbox.stub(Reaction, "hasPermission", () => true);

      // make a cart with two items from separate shops
      const cart = Factory.create("cartMultiShop", { accountId });

      expect(() =>
        Meteor.call("discounts/codes/apply", cart._id, code.code)).to.throw(ReactionError, /multiShopError/);
    });
  });
});
