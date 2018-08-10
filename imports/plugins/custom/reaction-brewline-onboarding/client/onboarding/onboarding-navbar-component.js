import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class OnboardingNavBar extends Component {
  static propTypes = {
    brandMedia: PropTypes.object,
    shop: PropTypes.object
  };

  state = {
    navBarVisible: false
  }

  toggleNavbarVisibility = () => {
    const isVisible = this.state.navBarVisible;
    this.setState({ navBarVisible: !isVisible });
  }

  handleCloseNavbar = () => {
    this.setState({ navBarVisible: false });
  }

  renderBrand() {
    const shop = this.props.shop || { name: "" };
    const logo = this.props.brandMedia && this.props.brandMedia.url({ store: "thumbnail" });

    return (
      <Components.Brand
        logo={logo}
        title={shop.name}
      />
    );
  }

  renderWelcomeMessage() {
    return <h3 className="title">Welcome to Brewline!</h3>;
  }

  renderContactUs() {
    return (
      <a
        target="_blank"
        className="btn btn-default contact-us"
        href="https://www.brewline.io/contact/"
      >
        Contact Us
      </a>
    );
  }

  render() {
    return (
      <div className="rui navbar navbar--onboarding">
        <div className="navbar-content">
          {this.renderBrand()}
          {this.renderWelcomeMessage()}
          {this.renderContactUs()}
        </div>
      </div>
    );
  }
}

export default OnboardingNavBar;
