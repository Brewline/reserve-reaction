import appEvents from "/imports/node-app/core/util/appEvents";
import Logger from "@reactioncommerce/logger";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Shops } from "/lib/collections";

import "./collections"; // TODO: move to ../lib/collections
import "./methods";

function addRolesToVisitors() {
  // Add the about permission to all default roles since it's available to all
  Logger.info("::: Adding onboarding route permissions to default roles");

  const shopId = Reaction.getShopId();

  Shops.update(shopId, {
    $addToSet: {
      defaultVisitorRole: [
        "brewlineOnboardingBrewery",
        "brewlineOnboardingCustomer"
      ]
    }
  });

  Shops.update(shopId, {
    $addToSet: {
      defaultRoles: [
        "brewlineOnboardingBrewery",
        "brewlineOnboardingCustomer"
      ]
    }
  });
}

/**
 * Hook to make additional configuration changes
 */
appEvents.on("afterCoreInit", () => {
  addRolesToVisitors();
});
