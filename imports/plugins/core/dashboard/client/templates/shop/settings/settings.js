import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { Reaction, i18next } from "/client/api";
import { Packages, Shops } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/client";
import SitemapSettingsContainer from "/imports/plugins/included/sitemap-generator/client/containers/sitemap-settings-container";
import PluginVersions from "../../../components/PluginVersions";
import ShopBrandMediaManager from "./ShopBrandMediaManager";


/**
 * shopSettings helpers
 *
 */
Template.shopSettings.helpers({
  checked(enabled) {
    if (enabled === true) {
      return "checked";
    }
    return "";
  },
  shown(enabled) {
    if (enabled !== true) {
      return "hidden";
    }
    return "";
  },
  ShopBrandMediaManager() {
    const shopId = Reaction.getShopId();

    const shop = Shops.findOne({
      "_id": shopId,
      "brandAssets.type": "navbarBrandImage"
    });

    let selectedMediaId;
    if (shop && Array.isArray(shop.brandAssets)) {
      selectedMediaId = shop.brandAssets[0].mediaId;
    }

    const userId = Reaction.getUserId();
    const metadata = { type: "brandAsset", ownerId: userId, shopId };

    const brandMediaList = Media.findLocal({
      "metadata.shopId": Reaction.getShopId(),
      "metadata.type": "brandAsset"
    });

    return {
      component: ShopBrandMediaManager,
      brandMediaList,
      metadata,
      selectedMediaId
    };
  },
  shop() {
    return Shops.findOne({
      _id: Reaction.getShopId()
    });
  },
  packageData() {
    return Packages.findOne({
      name: "core",
      shopId: Reaction.getShopId()
    });
  },
  addressBook() {
    const address = Shops.findOne({
      _id: Reaction.getShopId()
    }).addressBook;
    return address[0];
  },
  showAppSwitch(template) {
    if (template === "optionsShopSettings" || template === "ShopAddressValidationSettings") {
      // do not have switch for options card/panel
      return false;
    }

    if (Reaction.getMarketplaceSettings()) {
      // if marketplace is enabled, only the primary shop can switch apps on and off.
      return Reaction.getShopId() === Reaction.getPrimaryShopId();
    }

    // If marketplace is disabled, every shop can switch apps
    return true;
  }
});

/**
 * shopSettings autoform alerts
 */

AutoForm.hooks({
  shopEditForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.alerts.shopGeneralSettingsSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.alerts.shopGeneralSettingsFailed")} ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditAddressForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.alerts.shopAddressSettingsSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.alerts.shopAddressSettingsFailed")} ${error}`, "error");
    }
  }
});

AutoForm.hooks({
  shopEditExternalServicesForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.alerts.shopExternalServicesSettingsSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(
        `${i18next.t("admin.alerts.shopExternalServicesSettingsFailed")} ${error}`,
        "error"
      );
    }
  }
});

AutoForm.hooks({
  shopEditOptionsForm: {
    onSuccess() {
      return Alerts.toast(i18next.t("admin.alerts.shopOptionsSettingsSaved"), "success");
    },
    onError(operation, error) {
      return Alerts.toast(`${i18next.t("admin.alerts.shopOptionsSettingsFailed")} ${error}`, "error");
    }
  }
});

Template.shopSettings.events({
  "change input[name=enabled]": (event) => {
    const settingsKey = event.target.getAttribute("data-key");
    const packageId = event.target.getAttribute("data-id");
    const fields = [{
      property: "enabled",
      value: event.target.checked
    }];

    Meteor.call("registry/update", packageId, settingsKey, fields);
    Meteor.call("shop/togglePackage", packageId, !event.target.checked);
  }
});

Template.optionsShopSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "core",
      shopId: Reaction.getShopId()
    });
  },

  isPackageEnabled(name) {
    return Reaction.isPackageEnabled(name);
  },

  SitemapSettingsContainer() {
    return SitemapSettingsContainer;
  }
});

Template.shopSettings.helpers({
  versionedPackages() {
    const versionedPackages = Packages.find({ version: { $exists: true }, shopId: Reaction.getShopId() });
    return versionedPackages;
  },

  PluginVersions() {
    return PluginVersions;
  }
});
