import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts, Groups } from "/lib/collections";

/**
 * @name addRolesToGroups
 * @method
 * @memberof Core
 * @summary Add roles to the default groups for shops and updates any users that are in
 * those permission groups
 * Options:
 * allShops: add supplied roles to all shops, defaults to false
 * roles: Array of roles to add to default roles set
 * shops: Array of shopIds that should be added to set
 * groups: Groups to add roles to, Options: ["guest", "customer", "owner"]
 * @param {Object} options - See above for details
 * @returns {Number} result of Groups.update method (number of documents updated)
 */
export default function addRolesToGroups(options = { allShops: false, roles: [], shops: [], groups: ["guest"] }) {
  check(options.roles, [String]);
  check(options.allShops, Match.Maybe(Boolean));
  check(options.shops, Match.Maybe([String]));
  check(options.groups, Match.Maybe([String]));

  const { allShops, roles, shops, groups } = options;
  const query = {
    slug: {
      $in: groups
    }
  };

  if (!allShops) {
    // If we're not updating for all shops, we should only update for the shops passed in.
    query.shopId = { $in: shops || [] };
    Logger.debug(`Adding Roles: ${roles} to Groups: ${groups} for shops: ${shops}`);
  } else {
    Logger.debug(`Adding Roles: ${roles} to Groups: ${groups} for all shops`);
  }

  // Check if each group already has the roles. If so, skip updates for group & its users
  Groups.find(query).forEach((group) => {
    let areRolesInGroup = true;
    roles.forEach((role) => {
      if (group.permissions.includes(role) === false) {
        Logger.debug(`Role ${role} is not in ${group.name} group`);
        areRolesInGroup = false;
      }
    });

    if (areRolesInGroup === false) {
      Logger.debug(`Adding roles (${roles}) to ${group.name} group (${group._id})`);
      // Run heaviest queries asynchronously in the background
      Meteor.defer(() => {
        addRolesToGroupAndUsers(group, roles);
      });
    } else {
      Logger.debug(`Skipping roles already assigned to ${group.name} group and its users`);
    }
  });
}

/**
 * @name addRolesToGroupAndUsers
 * @private
 * @summary Adds the given roles to the given group and updates users, if necessary
 * @param {Object} group - Group to add roles to, and update users for
 * @param {String} group._id - Group's _id
 * @param {String} group.shopId - _id of shop group belongs to
 * @param {String} group.name - Name of group
 * @param {Array} roles - Array of roles/permissions (strings)
 * @returns {undefined} Nothing
 */
function addRolesToGroupAndUsers({ _id, shopId, name }, roles) {
  Groups.update({ _id }, { $addToSet: { permissions: { $each: roles } } });

  const maxAccountsPerUpdate = 100000;
  const accountSelector = { groups: _id };
  const numAccounts = Accounts.find(accountSelector).count();
  if (numAccounts === 0) {
    Logger.debug("No users need roles updated");
    return;
  }

  Logger.debug(`Number of users to add roles to: ${numAccounts}`);
  const numQueriesNeeded = Math.ceil(numAccounts / maxAccountsPerUpdate);
  Logger.debug(`Number of updates needed: ${numQueriesNeeded}`);

  const accountOptions = {
    fields: { _id: 1 },
    sort: { _id: 1 },
    limit: maxAccountsPerUpdate
  };
  let lastUserIdUpdated = "";

  for (let inc = 0; inc < numQueriesNeeded; inc += 1) {
    Logger.debug(`Processing user role update #${inc + 1} of ${numQueriesNeeded} for ${name} group, ${roles} roles`);

    if (lastUserIdUpdated) {
      accountSelector._id = {
        $gt: lastUserIdUpdated
      };
    }

    const userIds = Accounts.find(accountSelector, accountOptions).map((account) => account._id);
    const firstUserIdInBatch = userIds[0];
    const lastUserIdInBatch = userIds[userIds.length - 1];
    const userSelector = { _id: { $gte: firstUserIdInBatch, $lte: lastUserIdInBatch } };
    const userModifier = {
      $addToSet: {
        [`roles.${shopId}`]: {
          $each: roles
        }
      }
    };

    Meteor.users.update(userSelector, userModifier, { multi: true });

    lastUserIdUpdated = lastUserIdInBatch;
  }

  Logger.debug(`addRolesToGroupAndUsers completed for ${name} group, ${roles} roles`);
}
