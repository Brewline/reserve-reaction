import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  CardGroup,
  SettingsCard,
  Form
} from "/imports/plugins/core/ui/client/components";
import { SocialPackageConfig } from "/lib/collections/schemas";

const socialProviders = [
  {
    name: "facebook",
    icon: "fa fa-facebook",
    fields: ["profilePage"],
    enabled: true
  },
  {
    name: "twitter",
    icon: "fa fa-twitter",
    fields: ["username", "profilePage"],
    enabled: true
  },
  {
    name: "pinterest",
    icon: "fa fa-pinterest",
    fields: ["profilePage"],
    enabled: true
  },
  {
    name: "googleplus",
    icon: "fa fa-google-plus",
    fields: ["profilePage"],
    enabled: true
  }
];

class SocialSettings extends Component {
  static propTypes = {
    onSettingChange: PropTypes.func,
    onSettingEnableChange: PropTypes.func,
    onSettingExpand: PropTypes.func,
    onSettingsSave: PropTypes.func,
    packageData: PropTypes.object,
    preferences: PropTypes.object,
    providers: PropTypes.arrayOf(PropTypes.string),
    socialSettings: PropTypes.object
  }

  /**
   * @method addProvider
   * @summary Add a social provider, with field definitions required to render
   * the form which collects and stores settings like twitter handle and URL.
   * @example SocialSettings.addProvider("Untappd", {
   *   name: "untappd",
   *   icon: "fa fa-untappd",
   *   fields: ["profilePage"]
   * });
   * @param {object} definition data used to create the form
   * @param {string} definition.name key used to store data in the DB
   * @param {string} definition.icon icon className for UI
   * @param {string} definition.fields input fields in the form
   * @param {string} definition.enabled (optional) defaults to true
   * @returns {undefined}
   */
  static addProvider(definition) {
    socialProviders.push({ enabled: true, ...definition });
  }

  /**
   * @method disableProvider
   * @summary Disable a social provider, preventing it from appearing in a
   * Shop's social settings
   * @example SocialSettings.disableProvider("Untappd");
   * @param {string} name Display Name of the provider
   * @returns {undefined}
   */
  static disableProvider(name) {
    const providers = socialProviders.filter((p) => p.name === name);

    if (!providers || !providers.length) { return; }

    providers.forEach((p) => { p.enabled = false; });
  }

  getSchemaForField(provider, field) {
    return SocialPackageConfig.getDefinition(`settings.public.apps.${provider}.${field}`);
  }

  handleSettingChange = (event, value, name) => {
    if (typeof this.props.onSettingChange === "function") {
      const parts = name.split(".");
      this.props.onSettingChange(parts[0], parts[1], value);
    }
  }

  handleSubmit = (event, data, formName) => {
    if (typeof this.props.onSettingsSave === "function") {
      this.props.onSettingsSave(formName, data.doc);
    }
  }

  renderCards() {
    if (!this.props.packageData || !this.props.packageData.settings) { return; }
    if (!Array.isArray(socialProviders)) { return; }

    const enabledProviders = socialProviders.filter((p) => p.enabled);

    return enabledProviders.map((provider, index) => {
      const doc = {
        settings: {
          ...this.props.packageData.settings
        }
      };

      let enabled = false;
      if (this.props.socialSettings.settings.apps[provider.name]) {
        ({ enabled } = this.props.socialSettings.settings.apps[provider.name]);
      }

      return (
        <SettingsCard
          key={index}
          i18nKeyTitle={`admin.settings.public.apps.${provider.name}.title`}
          expandable={true}
          onExpand={this.props.onSettingExpand}
          expanded={this.props.preferences[provider.name]}
          title={provider.name}
          name={provider.name}
          enabled={enabled}
          icon={provider.icon}
          onSwitchChange={this.props.onSettingEnableChange}
        >
          <Form
            schema={SocialPackageConfig}
            doc={doc}
            docPath={`settings.public.apps.${provider.name}`}
            hideFields={[
              `settings.public.apps.${provider.name}.enabled`
            ]}
            name={`settings.public.apps.${provider.name}`}
            onSubmit={this.handleSubmit}
          />
        </SettingsCard>
      );
    });
  }

  render() {
    return (
      <CardGroup>
        {this.renderCards()}
      </CardGroup>
    );
  }
}

export default SocialSettings;
