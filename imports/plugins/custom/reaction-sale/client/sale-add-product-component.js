import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import {
  Modal,
  UntappdBreweryProductSearch,
  UntappdProductComponent
} from "@brewline/theme";

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
    shouldShowForm: false,
    fields: {}
  };

  handleTabChange = (_event, selectedTab) => {
    const { selectedTab: currentSelectedTab } = this.state;

    if (selectedTab === currentSelectedTab) { return; }

    this.setState({ selectedTab });
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

  renderSearchFormAndResults() {
    return (
      <Fragment>
        <UntappdBreweryProductSearch
          onClickProduct={this.handleImportProduct}
          shop={this.props.shop}
        />
        {this.renderForm()}
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

  renderPackagingOptions() {
    const options = [{
      title: "4 Pack (16oz. cans)",
      className: "packaging-option option-4-pack-cans"
    }, {
      title: "6 Pack (12oz. cans)",
      className: "packaging-option option-6-pack-cans"
    }, {
      title: "6 Pack (12oz. bottles)",
      className: "packaging-option option-6-pack-bottles"
    }];

    const { fields: { title } } = this.state;

    return (
      <div className="rui form-group">
        <label><span>Packaging</span></label>

        <div className="radio-group flex">
          {options.map((option, i) => {
            const selected = option.title === title;
            let { className = "" } = option;

            if (selected) {
              className += " selected";
            }

            return (
              <div className="flex-1" key={i}>
                <label className={className}>
                  <input
                    type="radio"
                    onClick={(e) => this.handleFieldChange(e, option.title, "title")}
                    selected={selected}
                    value={option.title}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  handleImportProduct = (untappdProduct) => {
    this.setState({ untappdProduct, shouldShowForm: true });
  }

  handleFieldChange = (_event, value, name) => {
    const { fields } = this.state;

    fields[name] = value;

    this.setState({ fields });
  }

  handleSubmit = () => {
    const { untappdProduct, fields } = this.state;

    // validation!

    this.props.onImportProductToSale(untappdProduct, fields);
  }

  renderForm() {
    const { fields, untappdProduct } = this.state;
    const product = { beer: untappdProduct };

    return (
      <Modal
        isOpen={this.state.shouldShowForm}
        onRequestClose={this.handleCancel}
        size="sm"
      >
        <h2>
          <Components.Translation defaultValue="Add to Release" i18nKey="sale.addProductToSale" />
        </h2>

        <UntappdProductComponent
          product={product}
          onClickProduct={() => {}}
        />

        <form>
          {this.renderPackagingOptions()}

          <Components.TextField
            i18nKeyLabel="product.price"
            label="Price"
            name="price"
            onChange={this.handleFieldChange}
            placeholder="price before platform fee"
            type="number"
            value={fields.price}
          />

          <Components.TextField
            i18nKeyLabel="product.inventoryQuantity"
            label="Quantity"
            name="inventoryQuantity"
            onChange={this.handleFieldChange}
            placeholder="units available online"
            type="number"
            value={fields.inventoryQuantity}
          />

          <Components.TextField
            i18nKeyLabel="product.inventoryLimit"
            label="Limit"
            name="inventoryLimit"
            onChange={this.handleFieldChange}
            placeholder="limit, in number of units"
            type="number"
            value={fields.inventoryLimit}
          />

          <Components.Button
            bezelStyle="solid"
            className={{
              btn: true
            }}
            label="Add to Release"
            onClick={this.handleSubmit}
            primary={true}
          />
        </form>
      </Modal>
    );
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
