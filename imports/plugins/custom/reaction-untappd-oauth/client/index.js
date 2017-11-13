import { ServiceConfigHelper } from "/imports/plugins/core/accounts/client/helpers/util";

ServiceConfigHelper.addProvider("Untappd", [
  { property: "clientId", label: "Client ID" },
  { property: "secret", label: "Client Secret" }
]);
