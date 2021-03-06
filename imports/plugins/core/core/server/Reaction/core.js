import Logger from "@reactioncommerce/logger";
import packageJson from "/package.json";
import _, { merge, uniqWith } from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { EJSON } from "meteor/ejson";
import * as Collections from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import ConnectionDataStore from "/imports/plugins/core/core/server/util/connectionDataStore";
import {
  customPublishedProductFields,
  customPublishedProductVariantFields,
  functionsByType,
  mutations,
  queries,
  resolvers,
  schemas
} from "../no-meteor/pluginRegistration";
import createGroups from "./createGroups";
import processJobs from "./processJobs";
import { registerTemplate } from "./templates";
import { AbsoluteUrlMixin } from "./absoluteUrl";
import { getUserId } from "./accountUtils";

/**
 * @file Server core methods
 *
 * @namespace Core
 */

// Unpack the named Collections we use.
const { Jobs, Packages, Shops, Accounts: AccountsCollection } = Collections;

export default {
  ...AbsoluteUrlMixin,

  init() {
    // make sure the default shop has been created before going further
    while (!this.getShopId()) {
      Logger.warn("No shopId, waiting one second...");
      Meteor._sleepForMs(1000);
    }

    // start job server
    Jobs.startJobServer(() => {
      Logger.info("JobServer started");
      processJobs();
      appEvents.emit("jobServerStart");
    });
    if (process.env.VERBOSE_JOBS) {
      Jobs.setLogStream(process.stdout);
    }

    this.loadPackages();
    // process imports from packages and any hooked imports
    this.Importer.flush();
    createGroups();
    this.setAppVersion();

    // Call `functionsByType.registerPluginHandler` functions for every plugin that
    // has supplied one, passing in all other plugins. Allows one plugin for check
    // for the presence of another plugin and read its config.
    const registerPluginHandlerFuncs = functionsByType.registerPluginHandler || [];
    const packageInfoArray = Object.values(this.Packages);
    registerPluginHandlerFuncs.forEach((registerPluginHandlerFunc) => {
      if (typeof registerPluginHandlerFunc !== "function") {
        throw new Error('A plugin registered a function of type "registerPluginHandler" which is not actually a function');
      }
      packageInfoArray.forEach(registerPluginHandlerFunc);
    });

    // DEPRECATED. Avoid consuming this hook in new code
    appEvents.emit("afterCoreInit");

    Logger.debug("Reaction.init() has run");

    return true;
  },

  Packages: {},

  registerPackage(packageInfo) {
    // Mutate globals with package info
    if (packageInfo.graphQL) {
      if (packageInfo.graphQL.resolvers) {
        merge(resolvers, packageInfo.graphQL.resolvers);
      }
      if (packageInfo.graphQL.schemas) {
        schemas.push(...packageInfo.graphQL.schemas);
      }
    }

    if (packageInfo.mutations) {
      merge(mutations, packageInfo.mutations);
    }

    if (packageInfo.queries) {
      merge(queries, packageInfo.queries);
    }

    if (packageInfo.functionsByType) {
      Object.keys(packageInfo.functionsByType).forEach((type) => {
        if (!Array.isArray(functionsByType[type])) {
          functionsByType[type] = [];
        }
        functionsByType[type].push(...packageInfo.functionsByType[type]);
      });
    }

    if (packageInfo.catalog) {
      const { publishedProductFields, publishedProductVariantFields } = packageInfo.catalog;
      if (Array.isArray(publishedProductFields)) {
        customPublishedProductFields.push(...publishedProductFields);
      }
      if (Array.isArray(publishedProductVariantFields)) {
        customPublishedProductVariantFields.push(...publishedProductVariantFields);
      }
    }

    // Save the package info
    this.Packages[packageInfo.name] = packageInfo;
    const registeredPackage = this.Packages[packageInfo.name];
    return registeredPackage;
  },
  defaultCustomerRoles: ["guest", "account/profile", "product", "tag", "index", "cart/completed"],
  defaultVisitorRoles: ["anonymous", "guest", "product", "tag", "index", "cart/completed"],
  createGroups,

  /**
   * @name canInviteToGroup
   * @method
   * @memberof Core
   * @summary checks if the user making the request is allowed to make invitation to that group
   * @param {Object} options -
   * @param {Object} options.group - group to invite to
   * @param {Object} options.user - user object  making the invite (Meteor.user())
   * @return {Boolean} -
   */
  canInviteToGroup(options) {
    const { group } = options;
    let { user } = options;
    if (!user) {
      user = Meteor.user();
    }
    const userPermissions = user.roles[group.shopId];
    const groupPermissions = group.permissions;

    // granting invitation right for user with `owner` role in a shop
    if (this.hasPermission(["owner"], getUserId(), group.shopId)) {
      return true;
    }

    // checks that userPermissions includes all elements from groupPermissions
    // we are not using Reaction.hasPermission here because it returns true if the user has at least one
    return _.difference(groupPermissions, userPermissions).length === 0;
  },

  /**
   * @name registerTemplate
   * @method
   * @memberof Core
   * @summary Registers Templates into the Templates Collection
   * @return {function} Registers template
   */
  registerTemplate,

  /**
   * @name hasPermission
   * @method
   * @memberof Core
   * @summary server permissions checks hasPermission exists on both the server and the client.
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} userId - userId, defaults to logged in userId
   * @param {String} checkGroup group - default to shopId
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission(checkPermissions, userId = getUserId(), checkGroup = this.getShopId()) {
    // check(checkPermissions, Match.OneOf(String, Array)); check(userId, String); check(checkGroup,
    // Match.Optional(String));
    let permissions;
    // default group to the shop or global if shop isn't defined for some reason.
    let group;
    if (checkGroup !== undefined && typeof checkGroup === "string") {
      group = checkGroup;
    } else {
      group = this.getShopId() || Roles.GLOBAL_GROUP;
    }

    // permissions can be either a string or an array we'll force it into an array and use that
    if (checkPermissions === undefined) {
      permissions = ["owner"];
    } else if (typeof checkPermissions === "string") {
      permissions = [checkPermissions];
    } else {
      permissions = checkPermissions;
    }

    // if the user has admin, owner permissions we'll always check if those roles are enough
    permissions.push("owner");
    permissions = _.uniq(permissions);

    // return if user has permissions in the group
    return Roles.userIsInRole(userId, permissions, group);
  },

  /**
   * @name hasOwnerAccess
   * @method
   * @memberof Core
   * @return {Boolean} Boolean - true if has permission
   */
  hasOwnerAccess() {
    return this.hasPermission(["owner"]);
  },

  /**
   * @name hasAdminAccess
   * @method
   * @memberof Core
   * @return {Boolean} Boolean - true if has permission
   */
  hasAdminAccess() {
    return this.hasPermission(["owner", "admin"]);
  },

  /**
   * @name hasDashboardAccess
   * @method
   * @memberof Core
   * @return {Boolean} Boolean - true if has permission
   */
  hasDashboardAccess() {
    return this.hasPermission(["owner", "admin", "dashboard"]);
  },

  /**
   * @summary Finds all shops that a user has a given set of roles for
   * @name getShopsWithRoles
   * @method
   * @memberof Core
   * @param  {array} roles an array of roles to check. Will return a shopId if the user has _any_ of the roles
   * @param  {string} userId Optional userId, defaults to logged in userId
   *                                           Must pass this.userId from publications to avoid error!
   * @return {array} Array of shopIds that the user has at least one of the given set of roles for
   */
  getShopsWithRoles(roles, userId = getUserId()) {
    // Owner permission for a shop superceeds grantable permissions, so we always check for owner permissions as well
    roles.push("owner");

    // Reducer that returns a unique list of shopIds that results from calling getGroupsForUser for each role
    return roles.reduce((shopIds, role) => {
      // getGroupsForUser will return a list of shops for which this user has the supplied role for
      const shopIdsUserHasRoleFor = Roles.getGroupsForUser(userId, role);

      // If we have new shopIds found, add them to the list
      if (Array.isArray(shopIdsUserHasRoleFor) && shopIdsUserHasRoleFor.length > 0) {
        // Create unique array from existing shopIds array and the shops
        return [...new Set([...shopIds, ...shopIdsUserHasRoleFor])];
      }

      // IF we don't have any shopIds returned, keep our existing list
      return shopIds;
    }, []);
  },

  /**
   * @name getSellerShopId
   * @method
   * @memberof Core
   * @return {String} Shop ID
   */
  getSellerShopId() {
    return Roles.getGroupsForUser(this.userId, "admin");
  },

  /**
   * @name getPrimaryShop
   * @summary Get the first created shop. In marketplace, the Primary Shop is the shop that controls the marketplace
   * and can see all other shops
   * @method
   * @memberof Core
   * @return {Object} Shop
   */
  getPrimaryShop() {
    const primaryShop = Shops.findOne({
      shopType: "primary"
    });

    return primaryShop;
  },

  /**
   * @name getPrimaryShopId
   * @summary Get the first created shop ID. In marketplace, the Primary Shop is the shop that controls the marketplace
   * and can see all other shops
   * @method
   * @memberof Core
   * @return {String} ID
   */
  getPrimaryShopId() {
    const primaryShop = this.getPrimaryShop();

    if (!primaryShop) { return null; }

    return primaryShop._id;
  },

  /**
   * @name getPrimaryShopName
   * @method
   * @summary Get primary shop name or empty string
   * @memberof Core
   * @return {String} Return shop name or empty string
   */
  getPrimaryShopName() {
    const primaryShop = this.getPrimaryShop();
    if (primaryShop) {
      return primaryShop.name;
    }
    return "";
  },

  /**
   * @name getPrimaryShopPrefix
   * @summary Get primary shop prefix for URL
   * @memberof Core
   * @method
   * @todo Primary Shop should probably not have a prefix (or should it be /shop?)
   * @return {String} Prefix in the format of "/<slug>"
   */
  getPrimaryShopPrefix() {
    return `/${this.getSlug(this.getPrimaryShopName().toLowerCase())}`;
  },

  /**
   * @name getPrimaryShopSettings
   * @method
   * @memberof Core
   * @summary Get primary shop settings object
   * @return {Object} Get settings object or empty object
   */
  getPrimaryShopSettings() {
    const settings = Packages.findOne({
      name: "core",
      shopId: this.getPrimaryShopId()
    }) || {};
    return settings.settings || {};
  },

  /**
   * @name getPrimaryShopCurrency
   * @method
   * @memberof Core
   * @summary Get primary shop currency string
   * @return {String} Get shop currency or "USD"
   */
  getPrimaryShopCurrency() {
    const primaryShop = this.getPrimaryShop();

    if (primaryShop && primaryShop.currency) {
      return primaryShop.currency;
    }

    return "USD";
  },

  /**
   * @summary **DEPRECATED** This method has been deprecated in favor of using getShopId
   * and getPrimaryShopId. To be removed.
   * @deprecated
   * @memberof Core
   * @method getCurrentShopCursor
   * @return {Cursor} cursor of shops that match the current domain
   */
  getCurrentShopCursor() {
    const domain = this.getDomain();
    const cursor = Shops.find({
      domains: domain
    });
    if (!cursor.count()) {
      Logger.debug(domain, "Add a domain entry to shops for ");
    }
    return cursor;
  },

  /**
   * @summary **DEPRECATED** This method has been deprecated in favor of using getShopId
   * and getPrimaryShopId. To be removed.
   * @deprecated
   * @memberof Core
   * @method getCurrentShop
   * @return {Object} returns the first shop object from the shop cursor
   */
  getCurrentShop() {
    const currentShopCursor = this.getCurrentShopCursor();
    // also, we could check in such a way: `currentShopCursor instanceof Object` but not instanceof something.Cursor
    if (typeof currentShopCursor === "object") {
      return currentShopCursor.fetch()[0];
    }
    return null;
  },

  /**
   * @name getShopId
   * @method
   * @memberof Core
   * @summary Get shop ID, first by checking the current user's preferences
   * then by getting the shop by the current domain.
   * @todo should we return the Primary Shop if none found?
   * @return {String} active shop ID
   */
  getShopId() {
    // is there a stored value?
    let shopId = ConnectionDataStore.get("shopId");

    // if so, return it
    if (shopId) {
      return shopId;
    }

    try {
      // otherwise, find the shop by user settings
      shopId = this.getUserShopId(getUserId());
    } catch (_e) {
      // an error when invoked outside of a method
      // call or publication, i.e., at startup. That's ok here.
    }

    // if still not found, look up the shop by domain
    if (!shopId) {
      shopId = this.getShopIdByDomain();
    }

    // use the primary shop id by default
    if (!shopId) {
      const domain = this.connectionDomain();
      Logger.warn(`No shop matching domain '${domain}'. Defaulting to Primary Shop.`);

      shopId = this.getPrimaryShopId();
    }

    // store the value for faster responses
    ConnectionDataStore.set("shopId", shopId);

    return shopId;
  },

  /**
   * @name clearCache
   * @method
   * @memberof Core
   * @summary allows the client to trigger an uncached lookup of the shopId.
   *          this is useful when a user switches shops.
   * @return {undefined}
   */
  resetShopId() {
    ConnectionDataStore.clear("shopId");
  },

  /**
   * @name isShopPrimary
   * @summary Whether the current shop is the Primary Shop (vs a Merchant Shop)
   * @method
   * @memberof Core
   * @return {Boolean} whether shop is flagged as primary
   */
  isShopPrimary() {
    return this.getShopId() === this.getPrimaryShopId();
  },

  /**
   * @name getShopIdByDomain
   * @method
   * @memberof Core
   * @summary searches for a shop which should be used given the current domain
   * @return {StringId} shopId
   */
  getShopIdByDomain() {
    const domain = this.getDomain();
    const primaryShop = this.getPrimaryShop();

    // in cases where the domain could match multiple shops, we first check
    // whether the primaryShop matches the current domain. If so, we give it
    // priority
    if (primaryShop && Array.isArray(primaryShop.domains) && primaryShop.domains.includes(domain)) {
      return primaryShop._id;
    }

    const shop = Shops.find({
      domains: domain
    }, {
      limit: 1,
      fields: {
        _id: 1
      }
    }).fetch()[0];

    return shop && shop._id;
  },

  /**
   * @name getUserShopId
   * @method
   * @memberof Core
   * @summary Get a user's shop ID, as stored in preferences
   * @todo This should intelligently find the correct default shop Probably whatever the main shop is or marketplace
   * @param {String} userId (probably logged in userId)
   * @return {StringId} active shop ID
   */
  getUserShopId(userId) {
    check(userId, String);

    return this.getUserPreferences({
      userId,
      packageName: "reaction",
      preference: "activeShopId"
    });
  },

  /**
   * @name getCartShopId
   * @method
   * @memberof Core
   * @summary Get the correct shop ID to use for Cart collection
   * @return {StringId} The primary or current shop ID, depending on merchantCart setting
   */
  getCartShopId() {
    const marketplaceSettings = this.getMarketplaceSettings();
    let shopId;
    if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantCart) {
      shopId = this.getShopId();
    } else {
      shopId = this.getPrimaryShopId();
    }
    return shopId;
  },

  /**
   * @name getShopName
   * @method
   * @memberof Core
   * @summary If we can't find the shop or shop name return an empty string
   * @return {String} Shop name or empty string ""
   */
  getShopName() {
    const shopId = this.getShopId();
    let shop;
    if (shopId) {
      shop = Shops.findOne({
        _id: shopId
      }, {
        fields: {
          name: 1
        }
      });
    } else {
      const domain = this.getDomain();
      shop = Shops.findOne({
        domains: domain
      }, {
        fields: {
          name: 1
        }
      });
    }
    if (shop && shop.name) {
      return shop.name;
    }
    return "";
  },

  /**
   * @name getShopPrefix
   * @method
   * @memberof Core
   * @summary Get shop prefix for URL
   * @return {String} String in the format of "/shop/slug"
   */
  getShopPrefix() {
    const shopName = this.getShopName();
    const lowerCaseShopName = shopName.toLowerCase();
    const slug = this.getSlug(lowerCaseShopName);
    const marketplace = Packages.findOne({
      name: "reaction-marketplace",
      shopId: this.getPrimaryShopId()
    });

    if (marketplace && marketplace.settings && marketplace.settings.public) {
      return `${marketplace.settings.public.shopPrefix}/${slug}`;
    }
    return `/${slug}`;
  },

  /**
   * @name getShopEmail
   * @method
   * @memberof Core
   * @summary Get shop email
   * @return {String} String with the first store email
   */
  getShopEmail() {
    const shop = Shops.find({
      _id: this.getShopId()
    }, {
      limit: 1,
      fields: {
        emails: 1
      }
    }).fetch()[0];
    return shop && shop.emails && shop.emails[0].address;
  },

  /**
   * @name getShopSettings
   * @method
   * @memberof Core
   * @summary Get shop settings object
   * @param  {String} [name="core"] Package name
   * @return {Object}               Shop settings object or empty object
   */
  getShopSettings(name = "core") {
    const settings = Packages.findOne({ name, shopId: this.getShopId() }) || {};
    return settings.settings || {};
  },

  /**
   * @name getShopCurrency
   * @method
   * @memberof Core
   * @summary Get shop currency
   * @return {String} Shop currency or "USD"
   */
  getShopCurrency() {
    const shop = Shops.findOne({
      _id: this.getShopId()
    });

    return (shop && shop.currency) || "USD";
  },

  /**
   * @name getShopCurrencies
   * @method
   * @memberof Core
   * @summary Get all currencies available to a shop
   * @return {Object} Shop currency or "USD"
   */
  getShopCurrencies() {
    const shop = Shops.findOne({
      _id: this.getShopId()
    });

    return shop && shop.currencies;
  },

  /**
   * @name getShopLanguage
   * @method
   * @memberof Core
   * @todo TODO: Marketplace - should each shop set their own default language or
   * should the Marketplace set a language that's picked up by all shops?
   * @return {String} language
   */
  getShopLanguage() {
    const { language } = Shops.findOne({
      _id: this.getShopId()
    }, {
      fields: {
        language: 1
      }
    });
    return language;
  },

  /**
   * @name getPackageSettings
   * @method
   * @memberof Core
   * @summary Get package settings
   * @param  {String} name Package name
   * @return {Object|null}      Package setting object or null
   */
  getPackageSettings(name) {
    return Packages.findOne({ name, shopId: this.getShopId() }) || null;
  },

  /**
   * @summary Takes options in the form of a query object. Returns a package that matches.
   * @method
   * @memberof Core
   * @name getPackageSettingsWithOptions
   * @param  {object} options Options object, forms the query for Packages.findOne
   * @return {object} Returns the first package found with the provided options
   */
  getPackageSettingsWithOptions(options) {
    const query = options;
    return Packages.findOne(query);
  },

  /**
   * @name getMarketplaceSettings
   * @method
   * @memberof Core
   * @summary finds the enabled `reaction-marketplace` package for
   * the primary shop and returns the settings
   * @return {Object} The marketplace settings from the primary shop or undefined
   */
  getMarketplaceSettings() {
    const marketplace = Packages.findOne({
      name: "reaction-marketplace",
      shopId: this.getPrimaryShopId(),
      enabled: true
    });

    if (marketplace && marketplace.settings) {
      return marketplace.settings;
    }
    return {};
  },

  /**
   * @name getUserPreferences
   * @method
   * @memberof Core
   * @param  {Object} options {packageName, preference, defaultValue}
   * @return {String|undefined} User's package preference or undefined
   */
  getUserPreferences(options) {
    const { userId, packageName, preference, defaultValue } = options;

    if (!userId) {
      return undefined;
    }

    const user = AccountsCollection.findOne({ _id: userId });

    if (user) {
      const { profile } = user;
      if (profile && profile.preferences && profile.preferences[packageName] && profile.preferences[packageName][preference]) {
        return profile.preferences[packageName][preference];
      }
    }
    return defaultValue || undefined;
  },

  /**
   * @name setUserPreferences
   * @method
   * @memberof Core
   * @summary save user preferences in the Accounts collection
   * @param {String} packageName
   * @param {String} preference
   * @param {String} value
   * @param {String} userId
   * @return {Number} setPreferenceResult
   */
  setUserPreferences(packageName, preference, value, userId) {
    const setPreferenceResult = AccountsCollection.update(userId, {
      $set: {
        [`profile.preferences.${packageName}.${preference}`]: value
      }
    });
    return setPreferenceResult;
  },

  /**
   * @name insertPackagesForShop
   * @method
   * @memberof Core
   * @summary insert Reaction packages into Packages collection registry for a new shop
   * - Assigns owner roles for new packages
   * - Imports layouts from packages
   * @param {String} shopId - the shopId to create packages for
   * @return {String} returns insert result
   */
  insertPackagesForShop(shopId) {
    const layouts = [];
    if (!shopId) {
      return [];
    }

    // Check to see what packages should be enabled
    const shop = Shops.findOne({ _id: shopId });
    const marketplaceSettings = this.getMarketplaceSettings();
    let enabledPackages;

    // Unless we have marketplace settings and an enabledPackagesByShopTypes Array
    // we will skip this
    if (marketplaceSettings &&
        marketplaceSettings.shops &&
        Array.isArray(marketplaceSettings.shops.enabledPackagesByShopTypes)) {
      // Find the correct packages list for this shopType
      const matchingShopType = marketplaceSettings.shops.enabledPackagesByShopTypes.find((EnabledPackagesByShopType) => EnabledPackagesByShopType.shopType === shop.shopType); // eslint-disable-line max-len
      if (matchingShopType) {
        ({ enabledPackages } = matchingShopType);
      }
    }

    const packages = this.Packages;
    // for each shop, we're loading packages in a unique registry
    // Object.keys(pkgConfigs).forEach((pkgName) => {
    for (const packageName in packages) {
      // Guard to prevent unexpected `for in` behavior
      if ({}.hasOwnProperty.call(packages, packageName)) {
        const config = packages[packageName];
        this.assignOwnerRoles(shopId, packageName, config.registry);

        const pkg = Object.assign({}, config, {
          shopId
        });

        // populate array of layouts that don't already exist (?!)
        if (pkg.layout) {
          // filter out layout templates
          for (const template of pkg.layout) {
            if (template && template.layout) {
              layouts.push(template);
            }
          }
        }

        if (enabledPackages && Array.isArray(enabledPackages)) {
          if (enabledPackages.indexOf(pkg.name) === -1) {
            pkg.enabled = false;
          } else if (pkg.settings && pkg.settings[packageName]) { // Enable "soft switch" for package.
            pkg.settings[packageName].enabled = true;
          }
        }
        Packages.insert(pkg);
        Logger.debug(`Initializing ${shopId} ${packageName}`);
      }
    }

    // helper for removing layout duplicates
    const uniqLayouts = uniqWith(layouts, _.isEqual);
    Shops.update({ _id: shopId }, { $set: { layout: uniqLayouts } });
  },

  /**
   * @name getAppVersion
   * @method
   * @memberof Core
   * @return {String} App version
   */
  getAppVersion() {
    return Shops.findOne().appVersion;
  },

  /**
   *  @name loadPackages
   *  @method
   *  @memberof Core
   *  @summary Insert Reaction packages into registry
   *  we check to see if the number of packages have changed against current data
   *  if there is a change, we'll either insert or upsert package registry
   *  into the Packages collection
   *  import is processed on hook in init()
   *  @return {String} returns insert result
   */
  async loadPackages() {
    const packages = Packages.find().fetch();

    let registryFixtureData;

    if (process.env.REACTION_REGISTRY) {
      // check the environment for the registry fixture data first
      registryFixtureData = process.env.REACTION_REGISTRY;
      Logger.info("Loaded REACTION_REGISTRY environment variable for registry fixture import");
    } else {
      // or attempt to load reaction.json fixture data
      try {
        registryFixtureData = Assets.getText("settings/reaction.json");
        Logger.info("Loaded \"/private/settings/reaction.json\" for registry fixture import");
      } catch (error) {
        Logger.warn("Skipped loading settings from reaction.json.");
        Logger.debug(error, "loadSettings reaction.json not loaded.");
      }
    }

    if (registryFixtureData) {
      const validatedJson = EJSON.parse(registryFixtureData);

      if (!Array.isArray(validatedJson[0])) {
        Logger.warn("Registry fixture data is not an array. Failed to load.");
      } else {
        registryFixtureData = validatedJson;
      }
    }

    const layouts = [];
    const shops = Shops.find().fetch();
    const totalPackages = Object.keys(this.Packages).length * shops.length;
    let loadedIndex = 1;
    // for each shop, we're loading packages in a unique registry
    _.each(this.Packages, (config, pkgName) =>
      shops.forEach((shop) => {
        const shopId = shop._id;
        if (!shopId) return [];

        // existing registry will be upserted with changes, perhaps we should add:
        this.assignOwnerRoles(shopId, pkgName, config.registry);

        // Settings from the package registry.js
        const settingsFromPackage = {
          name: pkgName,
          version: config.version,
          icon: config.icon,
          enabled: !!config.autoEnable,
          settings: config.settings,
          registry: config.registry,
          layout: config.layout
        };

        // Setting from a fixture file, most likely reaction.json
        let settingsFromFixture;
        if (registryFixtureData) {
          settingsFromFixture = registryFixtureData[0].find((packageSetting) => config.name === packageSetting.name);
        }

        // Setting already imported into the packages collection
        const settingsFromDB = packages.find((ps) => (config.name === ps.name && shopId === ps.shopId));

        const combinedSettings = merge({}, settingsFromPackage, settingsFromFixture || {}, settingsFromDB || {});

        // always use version from package
        if (combinedSettings.version) {
          combinedSettings.version = settingsFromPackage.version || settingsFromDB.version;
        }
        if (combinedSettings.registry) {
          combinedSettings.registry = combinedSettings.registry.map((entry) => {
            if (entry.provides && !Array.isArray(entry.provides)) {
              entry.provides = [entry.provides];
              Logger.warn(`Plugin ${combinedSettings.name} is using a deprecated version of the provides property for` +
                          ` the ${entry.name || entry.route} registry entry. Since v1.5.0 registry provides accepts` +
                          " an array of strings.");
            }
            return entry;
          });
        }

        // populate array of layouts that don't already exist in Shops
        if (combinedSettings.layout) {
          // filter out layout Templates
          for (const pkg of combinedSettings.layout) {
            if (pkg.layout) {
              layouts.push(pkg);
            }
          }
        }
        // Import package data
        this.Importer.package(combinedSettings, shopId);
        Logger.info(`Successfully initialized package: ${pkgName}... ${loadedIndex}/${totalPackages}`);
        loadedIndex += 1;
      }));

    // helper for removing layout duplicates
    const uniqLayouts = uniqWith(layouts, _.isEqual);
    // import layouts into Shops
    shops.forEach((shop) => {
      this.Importer.layout(uniqLayouts, shop._id);
    });

    //
    // package cleanup
    //
    const packageMapper = (shop) => packages
      .filter((p) => (!(p.name in this.Packages)))
      .map((p) => ({ shopId: shop._id, name: p.name }));

    const packageRemovalQueries = shops.flatMap(packageMapper);

    if (packageRemovalQueries.length) {
      // reduce the number of DB calls from `Shops.length` to 1.
      Packages.remove({ $or: packageRemovalQueries }, false);
    }

    Logger.info(`Successfully removed ${packageRemovalQueries.length} packages`);
  },

  /**
   * @name setAppVersion
   * @method
   * @memberof Core
   * @return {undefined} no return value
   */
  setAppVersion() {
    const { version } = packageJson;
    Logger.info(`Reaction Version: ${version}`);
    Shops.update({}, { $set: { appVersion: version } }, { multi: true });
  },

  /**
   * @summary Method for getting all schemas attached to a given collection
   * @deprecated by simpl-schema
   * @private
   * @name collectionSchema
   * @param  {string} collection The mongo collection to get schemas for
   * @param  {Object} [selector] Optional selector for multi schema collections
   * @return {Object} Returns a simpleSchema that is a combination of all schemas
   *                  that have been attached to the collection or false if
   *                  the collection or schema could not be found
   */
  collectionSchema(collection, selector) {
    Logger.warn("Reaction.collectionSchema is deprecated and will be removed" +
      " in a future release. Use collection.simpleSchema(selector).");

    const selectorErrMsg = selector ? `and selector ${selector}` : "";
    const errMsg = `Reaction.collectionSchema could not find schemas for ${collection} collection ${selectorErrMsg}`;

    const col = Collections[collection];
    if (!col) {
      Logger.warn(errMsg);
      // Return false so we don't pass a check that uses a non-existant schema
      return false;
    }

    const schema = col.simpleSchema(selector);
    if (!schema) {
      Logger.warn(errMsg);
      // Return false so we don't pass a check that uses a non-existant schema
      return false;
    }

    return schema;
  }
};
