import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, withMoment } from "@reactioncommerce/reaction-components";
import Products from "/imports/plugins/included/product-variant/components/products";

class SaleDetail extends Component {
  static propTypes = {
    // cartQuantity: PropTypes.number,
    editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    hasAdminPermission: PropTypes.bool,
    mediaGalleryComponent: PropTypes.node,
    moment: PropTypes.func,
    // onAddToCart: PropTypes.func,
    // onCartQuantityChange: PropTypes.func,
    onAddProduct: PropTypes.func,
    onDeleteSale: PropTypes.func,
    onEdit: PropTypes.func,
    onViewContextChange: PropTypes.func,
    products: PropTypes.arrayOf(PropTypes.object), // TODO: is there a productPropType?
    productsSubscription: PropTypes.object, // a Subscription
    sale: PropTypes.object,
    socialComponent: PropTypes.node,
    viewAs: PropTypes.string
  };

  get sale() {
    return this.props.sale || {};
  }

  get editable() {
    return this.props.editable;
  }

  get moment() {
    return this.props.moment;
  }

  renderDateRange() {
    const { beginsAt, endsAt } = this.sale;

    if (!this.moment) {
      return beginsAt.toString();
    }

    const now = this.moment();
    const mBeginsAt = this.moment(beginsAt);
    const mEndsAt = this.moment(endsAt);

    if (!mBeginsAt.isValid()) { return; }

    if (mBeginsAt.isAfter(now)) {
      return `Begins ${mBeginsAt.calendar()}`; // TODO: i18n
    }

    if (mEndsAt.isAfter(now)) {
      return `Ends in ${mBeginsAt.fromNow(true)}`; // TODO: i18n
    }

    return `Ended ${mEndsAt.calendar()}`; // TODO: i18n
  }

  renderEditButton() {
    if (!this.editable) { return; }

    return (
      <Components.Button
        label="Edit Sale"
        i18nKeyLabel="sale.edit"
        data-event-category="sales"
        onClick={this.props.onEdit}
      />
    );
  }

  renderAddProductButton() {
    if (!this.editable) { return; }

    return (
      <Components.Button
        label="Add Product"
        i18nKeyLabel="sale.addProduct"
        data-event-category="sales"
        onClick={this.props.onAddProduct}
        primary={true}
      />
    );
  }

  render() {
    const { headline, description } = this.sale;

    return (
      <div className="pdp" style={{ position: "relative" }}>
        <div className="container-main pdp-container" itemScope itemType="http://schema.org/SaleEvent">
          <div className="row">
            <Components.Alerts placement="saleManagement" />

            {this.renderEditButton()}

            <h1>{headline}</h1>

            <h2>{this.renderDateRange()}</h2>

            <p>{description}</p>

            <Components.Divider />

            {this.renderAddProductButton()}

            <Products
              loadMoreProducts={() => false}
              products={this.props.products}
              productsSubscription={this.props.productsSubscription}
              ready={() => true}
              showNotFound={false}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withMoment(SaleDetail);
