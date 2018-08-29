import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Random from "@reactioncommerce/random";
import { Logger } from "/server/api";
// import { Reaction, Logger } from "/server/api";
// import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import { WatchlistItems } from "@brewline/watchlist/lib/collections";

describe("Onboarding Methods", () => {
  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    WatchlistItems.remove({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("watchlist/save", () => {
    let currentUserId;
    let previousUserId;

    beforeEach(() => {
      currentUserId = Random.id();
      previousUserId = Random.id();
    });

    it("requires a previous user id", () => {
      expect(() => Meteor.call("onboarding/transferFavorites"))
        .to.throw(Match.Error, /Expected string, got undefined/);
    });

    it("requires a current user id", () => {
      sandbox.stub(Meteor, "userId", () => null);

      expect(() => Meteor.call("onboarding/transferFavorites", previousUserId))
        .to.throw(Match.Error, /Expected string, got null/);
    });

    it("transfers favorites from previous to current", () => {
      const loggerSpy = sandbox.stub(Logger, "warn");
      sandbox.stub(Meteor, "userId", () => currentUserId);

      WatchlistItems.insert(createWatchlistData(previousUserId));
      WatchlistItems.insert(createWatchlistData(previousUserId));

      // make sure we are set up correctly
      expect(WatchlistItems.find({ userId: previousUserId }).count())
        .to.equal(2);
      expect(WatchlistItems.find({ userId: currentUserId }).count())
        .to.equal(0);

      // do the work
      Meteor.call("onboarding/transferFavorites", previousUserId);

      expect(loggerSpy).to.have.been.called;

      // make sure the job got done
      expect(WatchlistItems.find({ userId: previousUserId }).count())
        .to.equal(0);
      expect(WatchlistItems.find({ userId: currentUserId }).count())
        .to.equal(2);
    });
  });

  function createWatchlistData(userId) {
    return {
      shopId: Random.id(),
      userId,
      watchlist: Random.id(),
      itemId: Random.id(),
      itemMetadata: {
        abc: Random.id(),
        def: Random.id()
      },
      displayName: Random.id()
    };
  }
});
