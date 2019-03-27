import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";

export default class Footer extends Component {
  static propTypes = {
    primaryShop: PropTypes.shape({
      name: PropTypes.string
    }),
    primaryShopMedia: PropTypes.object
  }

  handleGoToPrimaryShop = (event) => {
    const { primaryShop = {} } = this.props;
    const { _id: shopId } = primaryShop;

    event.preventDefault();

    Reaction.setShopId(shopId);
    // Reaction.Router.go("/");
  }

  renderBrand() {
    const { primaryShop = {}, primaryShopMedia } = this.props;
    const { name: title } = primaryShop;

    const logo = primaryShopMedia && primaryShopMedia.url({ store: "large" });

    // copied from Brand.js, with click handler replaced
    return (
      <a className="brand" href="/" onClick={this.handleGoToPrimaryShop}>
        <div className="logo" style={{ display: "inline-block" }}>
          <img src={logo} alt={title} style={{ height: "55px", marginRight: "10px" }} />
        </div>
        <span className="title">{title}</span>
      </a>
    );
  }

  render() {
    return (
      <div className="reaction-navigation-footer footer-default">
        <nav className="navbar-bottom">
          <div className="row">
            {this.renderBrand()}
          </div>
        </nav>
      </div>
    );
  }
}
