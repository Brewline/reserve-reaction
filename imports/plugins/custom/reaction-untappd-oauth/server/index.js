// import Untappd from "meteor-untappd-accounts";
import Reaction from "/imports/plugins/core/core/server/Reaction";

// Untappd is globally accessible
Untappd.rootUrl = function () {
  if (process.env.NODE_ENV === "development") {
    return "local.brewline.io";
  }

  return Reaction.absoluteUrl();
};
