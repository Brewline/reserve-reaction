import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

export default class SaleDetailSimpleToolbar extends Component {
  static propTypes = {
    hasCreateProductAccess: PropTypes.bool,
    onAddProduct: PropTypes.func,
    onEdit: PropTypes.func
  }

  renderAddButton() {
    return (
      <Components.FlatButton
        i18nKeyTooltip={"app.shortcut.addSaleProduct"}
        icon={"fa fa-plus"}
        label="Add Sale Product"
        i18nKeyLabel="sale.addProduct"
        tooltip={"Add Product to Sale"}
        onClick={this.props.onAddProduct}
      />
    );
  }

  renderEditButton() {
    return (
      <Components.FlatButton
        i18nKeyTooltip={"app.shortcut.editSale"}
        icon={"fa fa-edit"}
        label="Edit Sale"
        i18nKeyLabel="sale.edit"
        tooltip={"Edit Sale"}
        onClick={this.props.onEdit}
      />
    );
  }

  render() {
    if (!this.props.hasCreateProductAccess) { return null; }

    return (
      <Components.ToolbarGroup>
        {this.renderEditButton()}

        {this.renderAddButton()}
      </Components.ToolbarGroup>
    );
  }
}
