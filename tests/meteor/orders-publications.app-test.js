/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import Random from "@reactioncommerce/random";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";

import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import * as Collections from "/lib/collections";
import Fixtures from "/imports/plugins/core/core/server/fixtures";

Fixtures();

describe("Order Publication", function () {
  const shop = getShop();
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    Collections.Orders.remove();
  });

  afterEach(function () {
    sandbox.restore();
    Collections.Orders.remove();
  });

  describe("Orders", () => {
    it("should return shop orders for an admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Roles, "userIsInRole", () => true);
      const order = Factory.create("order", { status: "created" });
      const collector = new PublicationCollector({ userId: Random.id() });
      collector.collect("Orders", (collections) => {
        expect(collections.Orders.length).to.equal(1);
        const shopOrder = collections.Orders[0];
        expect(shopOrder.shopId).to.equal(order.shopId);
      }).then(() => done(/* empty */)).catch(done);
    });

    it("should not return shop orders for a non-admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Roles, "userIsInRole", () => false);
      Factory.create("order", { status: "created" });
      const collector = new PublicationCollector({ userId: Random.id() });
      collector.collect("Orders", (collections) => {
        expect(collections.Orders.length).to.equal(0);
      }).then(() => done(/* empty */)).catch(done);
    });
  });
});
