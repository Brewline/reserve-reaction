import React, { Component } from "react";
import { Reaction } from "/client/api";

export default class Footer extends Component {
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

    const logo = primaryShopMedia && primaryShopMedia.url({ store: "thumbnail" });

    // copied from Brand.js, with click handler replaced
    return (
      <a className="brand" href="/" onClick={this.handleGoToPrimaryShop}>
        <div className="logo">
          <img src={logo} alt={title} />
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
