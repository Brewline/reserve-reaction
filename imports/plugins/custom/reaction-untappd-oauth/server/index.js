// import Untappd from "meteor-untappd-accounts";
import { Reaction } from "/server/api";

// Untappd is globally accessible
Untappd.rootUrl = function () {
  if (process.env.NODE_ENV === "development") {
    return "local.brewline.io";
  }

  return Reaction.absoluteUrl();
};
