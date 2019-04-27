import { Migrations } from "meteor/percolate:migrations";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";

// export to allow us to run from a command line
export function createOnboardingUser() {
  const userUniqueKey = { username: "onboarding" };
  const accountUniqueKey = { username: "onboarding" };
  let { _id: onboardingUserId } = Meteor.users.findOne(userUniqueKey);
  const { _id: onboardingAccountId } = Accounts.findOne(accountUniqueKey) || {};

  if (onboardingUserId && onboardingAccountId) { return; }

  const now = new Date();

  const onboardingData = {
    createdAt: now,
    emails: [{
      address: "onboarding@brewline.io",
      verified: true,
      provides: "default"
    }],
    updatedAt: now
  };

  if (!onboardingUserId) {
    const adminUser = Meteor.users.findOne({ username: "admin" });
    const userData = {
      ...adminUser,
      ...onboardingData,
      // users-specific stuff
      ...userUniqueKey,
      services: {}
      // TODO: should roles be limited?
    };
    delete userData._id;
    delete userData.username;

    ({ _id: onboardingUserId } = Meteor.users.insert(userData));
  }

  const adminAccount = Accounts.findOne({ username: "admin" });
  const accountData = {
    ...adminAccount,
    ...onboardingData,
    // Accounts-specific stuff
    ...accountUniqueKey,
    userId: onboardingUserId
  };

  // although not ideal, most account ids === their corresponding user ids.
  // we keep that trend here by _not_ deleting accountData._id

  Accounts.insert(accountData);

  return true;
}

Migrations.add({
  version: 50.1,
  name: "Create an 'onboarding' user against which Shops can be created",
  up() {
    createOnboardingUser();
  }
});
