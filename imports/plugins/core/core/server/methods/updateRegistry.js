import _ from "lodash";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { mergeDeep } from "/lib/api";

/**
 * @name registry/update
 * @method
 * @memberof Registry/Methods
 * @example Meteor.call("registry/update", packageId, settingsKey, fields)
 * @param  {String} packageId id of package
 * @param  {String} name      Name of package
 * @param  {Array} fields     Fields to update
 * @todo Name could be optional. Just use package name as default.
 * @return {Boolean}          true on success, false on error
 */
export default function updateRegistry(packageId, name, fields) {
  check(packageId, String);
  check(name, String);
  check(fields, Array);
  // settings use just the last name from full name so that schemas don't need to define overly complex names based with
  // x/x/x formatting.
  // TODO Name could be optional. Just use package name as default
  const setting = name.split("/").splice(-1);
  let dataToSave = {};
  dataToSave[setting] = {};
  const currentPackage = Packages.findOne(packageId);

  _.each(fields, (field) => {
    dataToSave[setting][field.property] = field.value;
  });

  if (currentPackage && currentPackage.settings) {
    dataToSave = mergeDeep(currentPackage.settings, dataToSave);
  }
  // user must have permission to package to update settings
  if (Reaction.hasPermission([currentPackage.name])) {
    return Packages.upsert({
      _id: packageId,
      name: currentPackage.name,
      enabled: currentPackage.enabled
    }, {
      $set: {
        settings: dataToSave
      }
    }, { upsert: true });
  }

  return false;
}
