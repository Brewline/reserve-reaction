import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";

import DbTiming from "./db-timing";

Meteor.startup(() => {
  Logger.info("Starting DB Timing...");

  DbTiming({
    excludes: [
      "Jobs.find", // Jobs run on a loop
      "Jobs.update", // Jobs run on a loop
      "meteor_oauth_pendingRequestTokens.remove", // called periodically for security
      "meteor_oauth_pendingCredentials.remove" // called periodically for security
    ],
    withData: process.env.NODE_ENV === "development"
  });
});
