import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import {
  Modal,
  UntappdBreweryProductSearch
} from "@brewline/theme";
import SaleAddProductForm from "./sale-add-product-form-component";

const Tabs = {
  PRODUCTS: "PRODUCTS",
  SEARCH: "SEARCH"
};

export default class SaleAddProduct extends Component {
  static propTypes = {
    onAddProductToSale: PropTypes.func,
    onClickCreateProduct: PropTypes.func,
    onImportProductToSale: PropTypes.func,
    sale: PropTypes.object,
    shop: PropTypes.object
  };

  state = {
    selectedTab: Tabs.SEARCH,
    shouldShowForm: false
  };

  handleTabChange = (_event, selectedTab) => {
    const { selectedTab: currentSelectedTab } = this.state;

    if (selectedTab === currentSelectedTab) { return; }

    this.setState({ selectedTab });
  }

  handleImportProductToSale = (optionData) => {
    const { untappdProduct } = this.state;

    this.setState({ shouldShowForm: false });

    this.props.onImportProductToSale(untappdProduct, optionData);
  }

  renderProductsTabItem() {
    return (
      <Components.TabItem
        value={Tabs.PRODUCTS}
        onClick={this.handleTabChange}
        className="flex-1"
      >
        Products
      </Components.TabItem>
    );
  }

  renderSearchTabItem() {
    return (
      <Components.TabItem
        value={Tabs.SEARCH}
        onClick={this.handleTabChange}
        className="flex-1"
      >
        Search
      </Components.TabItem>
    );
  }

  renderProductsList() {
    return (
      <ul>
        <li>Product #1</li>
        <li>Product #2</li>
        <li>Product #3</li>
      </ul>
    );
  }

  renderFormModal() {
    const { untappdProduct } = this.state;
    return (
      <Modal
        isOpen={this.state.shouldShowForm}
        onRequestClose={this.handleCancel}
        size="sm"
      >
        <SaleAddProductForm
          onSubmit={this.handleImportProductToSale}
          untappdProduct={untappdProduct}
        />
      </Modal>
    );
  }

  renderSearchFormAndResults() {
    return (
      <Fragment>
        <UntappdBreweryProductSearch
          onClickProduct={this.handleImportProduct}
          shop={this.props.shop}
        />
        {this.renderFormModal()}
      </Fragment>
    );
  }

  renderNotAnUntappdShop() {
    return (
      <div>
        <p className="warning">
          This shop does not have an Untappd Id. Please contact us to correct this.
        </p>

        <p>
          In the mean time, you can create a product manually.
        </p>

        <Components.Button
          bezelStyle="solid"
          className={{
            btn: true
          }}
          label="Create Product"
          onClick={this.props.onClickCreateProduct}
          primary={true}
        />
      </div>
    );
  }

  renderPanelContent() {
    const { selectedTab } = this.state;

    if (selectedTab === Tabs.PRODUCTS) {
      return this.renderProductsList();
    }

    const { shop } = this.props;

    if (shop && !shop.UntappdId) {
      return this.renderNotAnUntappdShop();
    }

    return this.renderSearchFormAndResults();
  }

  handleCancel = () => {
    this.setState({ shouldShowForm: false });
  }

  handleImportProduct = (untappdProduct) => {
    this.setState({ untappdProduct, shouldShowForm: true });
  }

  render() {
    const { selectedTab } = this.state;

    return (
      <div className="panel panel-default">
        <div className="panel-heading panel-heading-flex">
          <div className="panel-title">
            <i className="fa fa-plus" />
            Add Product to Can Release {/* TODO: i18n */}
          </div>

          <div className="panel-controls" />
        </div>

        <div className="panel-body">
          <Components.TabList selectedTab={selectedTab} className="flex">
            {this.renderSearchTabItem()}
            {this.renderProductsTabItem()}
          </Components.TabList>

          {this.renderPanelContent()}
        </div>
      </div>
    );
  }
}
