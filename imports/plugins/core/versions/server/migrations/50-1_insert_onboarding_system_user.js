import { Migrations } from "meteor/percolate:migrations";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";

Migrations.add({
  version: 50.1,
  name: "Create an 'onboarding' user against which Shops can be created",
  up() {
    const now = new Date();

    const onboardingData = {
      createdAt: now,
      emails: [{
        address: "onboarding@brewline.io",
        verified: true,
        provides: "default"
      }],
      name: "Onboarding",
      updatedAt: now
    };

    const adminUser = Meteor.users.findOne({ username: "admin" });
    const adminAccount = Accounts.findOne({ username: "admin" });

    const userData = {
      ...adminUser,
      ...onboardingData,
      // users-specific stuff
      services: {}
      // TODO: should roles be limited?
    };
    delete userData._id;
    delete userData.username;

    const onboardingUserId =
      Meteor.users.update(
        { username: "onboarding" },
        userData,
        { bypassCollection2: true, upsert: true }
      );

    const accountData = {
      ...adminAccount,
      ...onboardingData,
      // Accounts-specific stuff
      userId: onboardingUserId
    };
    delete accountData._id;
    delete accountData.username;

    Accounts.insert(
      { username: "onboarding" },
      accountData,
      { bypassCollection2: true, upsert: true }
    );
  }
});
