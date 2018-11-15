import React, { Component } from "react";
import PropTypes from "prop-types";
import { Facebook, Twitter } from "/imports/plugins/included/social/client/components";
import { Instagram, Untappd } from "./";

export function getProviderComponentByName(providerName) {
  switch (providerName) {
    case "facebook":
      return Facebook;
    case "instagram":
      return Instagram;
    case "twitter":
      return Twitter;
    case "untappd":
      return Untappd;
    default:
      return null;
  }
}


class SocialButtons extends Component {
  buttonSettings(provider) {
    return this.props.settings.apps[provider];
  }

  renderButtons() {
    if (!this.props.providers) { return null; }

    return this.props.providers.map((providerName) => {
      const Provider = getProviderComponentByName(providerName);

      if (!Provider) { return null; }

      return (
        <Provider
          key={Provider.name}
          title={this.props.title}
          description={this.props.description}
          url={this.props.url}
          settings={this.buttonSettings(providerName)}
        />
      );
    });
  }

  render() {
    return (
      <div className="rui social-buttons">
        {this.renderButtons()}
      </div>
    );
  }
}

SocialButtons.propTypes = {
  description: PropTypes.string,
  editButton: PropTypes.node,
  providers: PropTypes.arrayOf(PropTypes.string),
  settings: PropTypes.shape({
    apps: PropTypes.object
  }),
  title: PropTypes.string,
  url: PropTypes.string
};

export default SocialButtons;
