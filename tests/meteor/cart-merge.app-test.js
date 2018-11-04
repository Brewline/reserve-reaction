/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { check, Match } from "meteor/check";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import ReactionError from "@reactioncommerce/reaction-error";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import * as Collections from "/lib/collections";
import Fixtures from "/imports/plugins/core/core/server/fixtures";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";

Fixtures();

describe("Merge Cart function ", function () {
  const shop = getShop();
  let originals;
  let sandbox;
  let pushCartWorkflowStub;
  let user;
  let account;
  let userId;
  let accountId;

  before(function () {
    originals = {
      mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
      addToCart: Meteor.server.method_handlers["cart/addToCart"]
    };

    Collections.Products.remove({});

    // mock it. If you want to make full integration test, comment this out
    pushCartWorkflowStub = sinon.stub(Meteor.server.method_handlers, "workflow/pushCartWorkflow", function (...args) {
      check(args, [Match.Any]);
      return true;
    });

    user = Factory.create("user");
    account = Factory.create("account", { userId: user._id });
    userId = user._id;
    accountId = account._id;
  });

  after(function () {
    pushCartWorkflowStub.restore();
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    Collections.Cart.remove({});
  });

  afterEach(function () {
    sandbox.restore();
    Meteor.users.remove({});
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function (...args) {
      check(args, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, args);
    });
  }

  it("should merge all anonymous carts into existent `normal` user cart per session, when logged in", function () {
    sandbox.stub(Reaction, "getShopId", () => shop._id);
    let anonymousCart = Factory.create("anonymousCart");
    let cart = Factory.create("cart", { accountId });
    let cartCount = Collections.Cart.find().count();
    expect(cartCount).to.equal(2);
    spyOnMethod("mergeCart", userId);
    const cartRemoveSpy = sandbox.spy(Collections.Cart, "remove");
    const token = Random.id();
    Collections.Cart.update({ _id: cart }, { $set: { anonymousAccessToken: hashLoginToken(token) } });
    const mergeResult = Meteor.call("cart/mergeCart", cart._id, anonymousCart, token);
    expect(mergeResult).to.be.ok;
    anonymousCart = Collections.Cart.findOne({ _id: anonymousCart._id });
    cart = Collections.Cart.findOne({ _id: cart._id });
    cartCount = Collections.Cart.find().count();
    expect(cartCount).to.equal(1);
    expect(cartRemoveSpy).to.have.been.called;
    expect(anonymousCart).to.be.undefined;
    expect(cart.items.length).to.equal(2);
  });

  it("should increase product quantity if anonymous cart items exists in user's cart before merge", function () {
    sandbox.stub(Reaction, "getShopId", () => shop._id);
    const anonymousCart = Factory.create("anonymousCart");
    let cart = Factory.create("cartOne"); // registered user cart
    let cartCount = Collections.Cart.find().count();
    expect(cartCount).to.equal(2);
    const initialCartQty = cart.items[0].quantity;
    Collections.Cart.update({
      "_id": anonymousCart._id, "items._id": anonymousCart.items[0]._id
    }, { $set: { "items.$.variantId": cart.items[0].variantId } });
    spyOnMethod("mergeCart", userId);
    const cartRemoveSpy = sandbox.spy(Collections.Cart, "remove");
    const token = Random.id();
    Collections.Cart.update({ _id: cart._id }, { $set: { anonymousAccessToken: hashLoginToken(token) } });
    const mergeResult = Meteor.call("cart/mergeCart", cart._id, anonymousCart._id, token);
    expect(mergeResult).to.be.ok;
    const anonymousCartAfterMerge = Collections.Cart.findOne({ _id: anonymousCart._id });
    cart = Collections.Cart.findOne({ _id: cart._id });
    cartCount = Collections.Cart.find().count();
    expect(cartCount).to.equal(1);
    expect(cartRemoveSpy).to.have.been.called;
    expect(anonymousCartAfterMerge).to.be.undefined;
    expect(cart.items[0].quantity).to.be.above(initialCartQty);
  });

  it("should merge only into registered user cart", function (done) {
    sandbox.stub(Reaction, "getShopId", function () {
      return shop._id;
    });
    const cart = Factory.create("anonymousCart");
    spyOnMethod("mergeCart", userId);
    const cartId = cart._id;
    // now we try to merge two anonymous carts. We expect to see `false`
    // result
    expect(Meteor.call("cart/mergeCart", cartId)).to.be.false;
    return done();
  });

  it("should throw an error if cart doesn't exist", function (done) {
    spyOnMethod("mergeCart", "someIdHere");
    function mergeCartFunction() {
      Meteor.call("cart/mergeCart", "non-existent-id", "123", "123");
    }
    expect(mergeCartFunction).to.throw(ReactionError, /Access Denied/);
    return done();
  });

  it("should throw an error if cart user is not current user", function (done) {
    const cart = Factory.create("cart");
    spyOnMethod("mergeCart", "someIdHere");
    function mergeCartFunction() {
      return Meteor.call("cart/mergeCart", cart._id, "123", "123");
    }
    expect(mergeCartFunction).to.throw(ReactionError, /Access Denied/);
    return done();
  });
});
