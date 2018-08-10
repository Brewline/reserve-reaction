import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Random from "@reactioncommerce/random";
import { Reaction, Logger } from "/server/api";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { WatchlistItems as WatchlistItemsCollection } from "../../lib/collections";

describe.only("Watchlist methods", () => {
  const sandbox = sinon.sandbox.create();
  let userId;
  let shopId;
  let watchlist;
  let itemId;
  let watchlistData;

  beforeEach(() => {
    userId = Random.id();
    shopId = Random.id();
    watchlist = Random.id();
    itemId = Random.id();
    watchlistData = createWatchlistData();
    ({ itemId } = watchlistData);

    WatchlistItemsCollection.remove({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("watchlist/save", () => {
    let upsertSpy;

    beforeEach(() => {
      upsertSpy = sandbox.spy(WatchlistItemsCollection, "upsert");
    });

    it("requires a user id", () => {
      sandbox.stub(Meteor, "userId", () => null);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      expect(() => Meteor.call("watchlist/save"))
        .to.throw(Match.Error, /Expected string, got null/);
    });

    it("requires a shopId", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => null);

      expect(() => Meteor.call("watchlist/save"))
        .to.throw(Match.Error, /Expected string, got null/);
    });

    it("requires a watchlist (name)", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      expect(() => Meteor.call("watchlist/save"))
        .to.throw(Match.Error, /Expected string, got undefined/);
    });

    it("requires a watchlist data", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      expect(() => Meteor.call("watchlist/save", watchlist))
        .to.throw(Match.Error, /Expected object, got undefined/);
    });

    it("requires valid watchlist data", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      expect(() => Meteor.call("watchlist/save", watchlist, {}))
        .to.throw(Meteor.Error, /itemId \(from source data\) is required/);
    });

    it("adds a WatchlistItem", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      const response = Meteor.call("watchlist/save", watchlist, watchlistData);
      expect(response.numberAffected).to.equal(1);
      expect(response.insertedId).not.to.be.undefined;

      expect(upsertSpy).to.have.been.called;

      const items =
        WatchlistItemsCollection.find({ userId, shopId, watchlist, itemId }).fetch();
      expect(items.length).to.equal(1);
      expect(items[0].displayName).to.equal(watchlistData.displayName);
      // just checking some things about Mongo & the Schema definition
      expect(items[0]._id).not.to.be.undefined;
      expect(items[0].createdAt).to.be.above(new Date(2018, 1, 1));
    });

    it("updates an existing WatchlistItem", () => {
      let items;

      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      Meteor.call("watchlist/save", watchlist, watchlistData);

      items =
        WatchlistItemsCollection.find({ userId, shopId, watchlist, itemId }).fetch();
      const initialUpdatedAt = items[0].updatedAt;

      // make a second call, which should update the previous

      const response = Meteor.call("watchlist/save", watchlist, watchlistData);
      expect(response.numberAffected).to.equal(1);
      expect(response.insertedId).to.be.undefined;

      expect(upsertSpy).to.have.been.called;

      items =
        WatchlistItemsCollection.find({ userId, shopId, watchlist, itemId }).fetch();
      expect(items.length).to.equal(1);
      expect(items[0].updatedAt).to.be.above(initialUpdatedAt);
    });
  });

  describe("watchlist/remove", () => {
    let upsertSpy;

    beforeEach(() => {
      upsertSpy = sandbox.spy(WatchlistItemsCollection, "update");
    });

    it("requires a user id", () => {
      sandbox.stub(Meteor, "userId", () => null);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      expect(() => Meteor.call("watchlist/remove"))
        .to.throw(Match.Error, /Expected string, got null/);
    });

    it("requires a shopId", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => null);

      expect(() => Meteor.call("watchlist/remove"))
        .to.throw(Match.Error, /Expected string, got null/);
    });

    it("requires a watchlist (name)", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      expect(() => Meteor.call("watchlist/remove"))
        .to.throw(Match.Error, /Expected string, got undefined/);
    });

    it("requires a watchlist data", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      expect(() => Meteor.call("watchlist/remove", watchlist))
        .to.throw(Match.Error, /Expected string, got undefined/);
    });

    it("requires either an itemId or a document _id: itemId", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      WatchlistItemsCollection.insert(Object.assign({
        userId,
        shopId,
        watchlist
      }, watchlistData));

      const count =
        Meteor.call("watchlist/remove", watchlist, watchlistData.itemId);

      expect(count).to.equal(1);
    });

    it("requires either an itemId or a document _id: _id", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      const _id = WatchlistItemsCollection.insert(Object.assign({
        userId,
        shopId,
        watchlist
      }, watchlistData));

      const count = Meteor.call("watchlist/remove", watchlist, _id);

      expect(count).to.equal(1);
    });

    it("returns 0 if no record was found", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      sandbox.stub(Logger, "warn"); // expected behavior, so let's keep the output clean

      const count = Meteor.call("watchlist/remove", watchlist, "nope!");

      expect(count).to.equal(0);
    });

    it("doesn't really delete, just sets isDeleted!", () => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      const _id = WatchlistItemsCollection.insert(Object.assign({
        userId,
        shopId,
        watchlist
      }, watchlistData));

      Meteor.call("watchlist/remove", watchlist, _id);

      sinon.assert.calledWith(
        upsertSpy,
        sinon.match.any,
        sinon.match({ $set: sinon.match({ isDeleted: true }) })
      );
    });
  });

  describe("WatchlistItems Publication", () => {
    let collector;

    beforeEach(() => {
      collector = new PublicationCollector({ userId: Random.id() });
    });

    it("requires a user id", (done) => {
      sandbox.stub(Meteor, "userId", () => null);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      collector.collect("WatchlistItems", null, () => {})
        .then(() => done("expected an error"))
        .catch(errorMatching(/Expected string, got null/, done));
    });

    it("requires a shopId", (done) => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => null);

      collector.collect("WatchlistItems", null, () => {})
        .then(() => done("expected an error"))
        .catch(errorMatching(/Expected string, got null/, done));
    });

    it("requires a watchlist (name)", (done) => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      collector.collect("WatchlistItems", null, () => {})
        .then(() => done("expected an error"))
        .catch(errorMatching(/Expected string, got null/, done));
    });

    it("lists items", (done) => {
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);

      const data = {
        userId,
        shopId,
        watchlist
      };

      // expected items
      WatchlistItemsCollection.insert(Object.assign({}, data, createWatchlistData()));
      WatchlistItemsCollection.insert(Object.assign({}, data, createWatchlistData()));
      WatchlistItemsCollection.insert(Object.assign({}, data, createWatchlistData()));
      // unexpected items
      WatchlistItemsCollection.insert(Object.assign({}, data, createWatchlistData(), {
        userId: `xxx${userId}xxx`
      }));
      WatchlistItemsCollection.insert(Object.assign({}, data, createWatchlistData(), {
        shopId: `xxx${shopId}xxx`
      }));
      WatchlistItemsCollection.insert(Object.assign({}, data, createWatchlistData(), {
        watchlist: `xxx${watchlist}xxx`
      }));

      collector.collect("WatchlistItems", watchlist, ({ WatchlistItems }) => {
        const items = WatchlistItems.map((product) => product._id);

        expect(items.length).to.equal(3);
      }).then(() => done(/* empty */)).catch(done);
    });
  });

  function createWatchlistData() {
    return {
      itemId: Random.id(),
      itemMetadata: {
        abc: Random.id(),
        def: Random.id()
      },
      displayName: Random.id()
    };
  }

  function errorMatching(regex, done) {
    return (error) => {
      if (error.message.match(regex)) {
        done();
      } else {
        done("Expected userId error");
      }
    };
  }
});
