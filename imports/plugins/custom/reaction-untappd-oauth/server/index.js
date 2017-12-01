// import Untappd from "meteor-untappd-accounts";
import { Reaction } from "/server/api";

// Untappd is globally accessible
Untappd.rootUrl = function () {
  // return Reaction.absoluteUrl();
  return "local.brewline.io";
};
