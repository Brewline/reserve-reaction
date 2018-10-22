import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { UntappdProductComponent } from "@brewline/theme";

export default class SaleAddProductForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    untappdProduct: PropTypes.object
  }

  state = {
    fields: {}
  }

  handleFieldChange = (_event, value, name) => {
    const { fields } = this.state;

    fields[name] = value;

    this.setState({ fields });
  }

  handleSubmit = () => {
    const { fields } = this.state;

    // validation!

    this.props.onSubmit(fields);
  }

  renderPackagingOptions() {
    const options = [{
      title: "4 Pack (16oz. cans)",
      className: "option-4-pack-cans"
    }, {
      title: "6 Pack (12oz. cans)",
      className: "option-6-pack-cans"
    }, {
      title: "6 Pack (12oz. bottles)",
      className: "option-6-pack-bottles"
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
              <div className="packaging-option flex-1" key={i}>
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

  render() {
    const { fields } = this.state;
    const { untappdProduct } = this.props;
    const product = { beer: untappdProduct };

    return (
      <Fragment>
        <h2>
          <Components.Translation
            defaultValue="Add to Release"
            i18nKey="sale.addProductToSale"
          />
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
      </Fragment>
    );
  }
}
