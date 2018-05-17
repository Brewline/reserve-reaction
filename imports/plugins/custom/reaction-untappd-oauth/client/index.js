// import Untappd from "meteor-untappd-accounts";
import { Reaction } from "/client/api";
import { ServiceConfigHelper } from "/imports/plugins/core/accounts/client/helpers/util";

ServiceConfigHelper.addProvider("Untappd", [
  { property: "clientId", label: "Client ID" },
  { property: "secret", label: "Client Secret" }
]);

// Untappd is globally accessible
Untappd.rootUrl = function () {
  return Reaction.absoluteUrl();
};
