import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _ from "lodash";
import { Components } from "@reactioncommerce/reaction-components";
import { findCurrency } from "/client/api";
import { highlightVariantInput } from "/imports/plugins/core/ui/client/helpers/animations";

const fieldNames = [
  "optionTitle",
  "title",
  "originCountry",
  "compareAtPrice",
  "price",
  "width",
  "length",
  "height",
  "weight",
  "taxCode",
  "taxDescription",
  "inventoryQuantity",
  "inventoryPolicy",
  "lowInventoryWarningThreshold"
];

class VariantForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedCard: props.editFocus,
      variant: props.variant,
      inventoryPolicy: props.variant.inventoryPolicy,
      isTaxable: props.variant.isTaxable,
      inventoryManagement: props.variant.inventoryManagement
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
    const nextVariant = nextProps.variant || {};
    const currentVariant = this.props.variant || {};

    if (_.isEqual(nextVariant, currentVariant) === false) {
      for (const fieldName of fieldNames) {
        if (nextVariant[fieldName] !== currentVariant[fieldName]) {
          if (fieldName !== "taxCode") {
            this.animateFieldFlash(fieldName);
          }
        }
      }

      this.setState({
        expandedCard: nextProps.editFocus,
        inventoryManagement: nextProps.variant.inventoryManagement,
        inventoryPolicy: nextProps.variant.inventoryPolicy,
        isTaxable: nextProps.variant.isTaxable,
        variant: nextProps.variant
      });
    }

    this.setState({
      expandedCard: nextProps.editFocus
    });
  }

  animateFieldFlash(fieldName) {
    const fieldRef = this.refs[`${fieldName}Input`];

    if (fieldRef) {
      const { input } = fieldRef.refs;
      highlightVariantInput(input);
    }
  }

  get variant() {
    return this.state.variant || this.props.variant || {};
  }

  handleFieldChange = (event, value, field) => {
    this.setState(({ variant }) => ({
      variant: {
        ...variant,
        [field]: value
      }
    }));
  }

  handleFieldBlur = (event, value, field) => {
    if (this.props.onVariantFieldSave) {
      this.props.onVariantFieldSave(this.variant._id, field, value, this.state.variant);
    }
  }

  handleSelectChange = (value, field) => {
    this.setState(({ variant }) => ({
      variant: {
        ...variant,
        [field]: value
      }
    }), () => {
      if (this.props.onVariantFieldSave) {
        this.props.onVariantFieldSave(this.variant._id, field, value, this.state.variant);
      }
    });
  }

  handleCheckboxChange = (event, value, field) => {
    this.setState(({ variant }) => ({
      variant: {
        ...variant,
        [field]: value
      }
    }), () => {
      if (this.props.onVariantFieldSave) {
        this.props.onVariantFieldSave(this.variant._id, field, value, this.state.variant);
      }
    });
  }

  handleInventoryPolicyChange = (event, value, field) => {
    /*
    Due to some confusing verbiage on how inventoryPolicy works / is displayed, we need to handle this field
    differently than we handle the other checkboxes in this component. Specifically, we display the opposite value of
    what the actual field value is. Because this is a checkbox, that means that the opposite value is actually the
    field value as well, not just a display value, so we need to reverse the boolean value when it gets passed into
    this function before we send it to the server to update the data. Other than reversing the value, this function
    is the same as `handleCheckboxChange`.
    */

    const inverseValue = !value;

    this.setState(({ variant }) => ({
      inventoryPolicy: inverseValue,
      variant: {
        ...variant,
        [field]: inverseValue
      }
    }));

    this.handleFieldBlur(event, inverseValue, field);
  }

  handleCardExpand = (event, card, cardName, isExpanded) => {
    if (typeof this.props.onCardExpand === "function") {
      this.props.onCardExpand(isExpanded ? cardName : undefined);
    }
  }

  handleVariantVisibilityToggle = (variant) => this.props.onVisibilityButtonClick(variant)

  isExpanded = (groupName) => this.state.expandedCard === groupName

  renderTaxCodeField() {
    const { taxCodes, validation } = this.props;

    if (Array.isArray(taxCodes) && taxCodes.length) {
      const options = taxCodes.map(({ code, label }) => ({ label, value: code }));
      options.unshift({ label: "None", value: "" });
      return (
        <Components.Select
          clearable={false}
          i18nKeyLabel="productVariant.taxCode"
          i18nKeyPlaceholder="productVariant.selectTaxCode"
          label="Tax Code"
          name="taxCode"
          ref="taxCodeInput"
          options={options}
          onChange={this.handleSelectChange}
          value={this.variant.taxCode}
        />
      );
    }
    return (
      <Components.TextField
        i18nKeyLabel="productVariant.taxCode"
        label="Tax Code"
        name="taxCode"
        ref="taxCodeInput"
        value={this.variant.taxCode}
        onBlur={this.handleFieldBlur}
        onChange={this.handleFieldChange}
        onReturnKeyDown={this.handleFieldBlur}
        validation={validation}
      />
    );
  }

  renderArchiveButton() {
    if (this.props.isDeleted) {
      return (
        <Components.Button
          icon="refresh"
          className="rui btn btn-default btn-restore-variant flat"
          tooltip="Restore"
          onClick={() => this.props.restoreVariant(this.variant)}
        />
      );
    }
    return (
      <Components.Button
        icon="archive"
        className="rui btn btn-default btn-remove-variant flat"
        tooltip="Archive"
        onClick={() => this.props.removeVariant(this.variant)}
      />
    );
  }

  renderArchivedLabel() {
    if (this.props.isDeleted) {
      return (
        <div className="panel-subheading">
          <span className="badge badge-danger" data-i18n="app.archived">
            <span>Archived</span>
          </span>
        </div>
      );
    }

    return null;
  }

  renderInventoryPolicyField() {
    if (this.props.hasChildVariants(this.variant)) {
      return (
        <div className="col-sm-12">
          <Components.Switch
            i18nKeyLabel="productVariant.inventoryPolicy"
            i18nKeyOnLabel="productVariant.inventoryPolicy"
            name="inventoryPolicy"
            label={"Allow backorder"}
            onLabel={"Allow backorder"}
            checked={!this.state.inventoryPolicy}
            onChange={this.handleInventoryPolicyChange}
            validation={this.props.validation}
            disabled={true}
            helpText={"Backorder allowance is now controlled by options"}
            i18nKeyHelpText={"admin.helpText.variantBackorderToggle"}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
          />
        </div>
      );
    }

    return (
      <div className="col-sm-12">
        <Components.Switch
          i18nKeyLabel="productVariant.inventoryPolicy"
          i18nKeyOnLabel="productVariant.inventoryPolicy"
          name="inventoryPolicy"
          label={"Allow backorder"}
          onLabel={"Allow backorder"}
          checked={!this.state.inventoryPolicy}
          onChange={this.handleInventoryPolicyChange}
          validation={this.props.validation}
        />
      </div>
    );
  }

  renderQuantityField() {
    if (this.props.hasChildVariants(this.variant)) {
      return (
        <div className="col-sm-6">
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryQuantity"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="Quantity"
            type="number"
            name="inventoryQuantity"
            ref="inventoryQuantityInput"
            value={this.props.onUpdateQuantityField(this.variant)}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
            disabled={true}
            helpText={"Variant inventory is now controlled by options"}
            i18nKeyHelpText={"admin.helpText.variantInventoryQuantity"}
          />
        </div>
      );
    }

    return (
      <div className="col-sm-6">
        <Components.TextField
          i18nKeyLabel="productVariant.inventoryQuantity"
          i18nKeyPlaceholder="0"
          placeholder="0"
          label="Quantity"
          type="number"
          name="inventoryQuantity"
          ref="inventoryQuantityInput"
          value={this.variant.inventoryQuantity}
          onChange={this.handleFieldChange}
          onBlur={this.handleFieldBlur}
          onReturnKeyDown={this.handleFieldBlur}
          validation={this.props.validation}
          helpText={"Option inventory"}
          i18nKeyHelpText={"admin.helpText.optionInventoryQuantity"}
        />
      </div>
    );
  }

  renderVariantFields() {
    const cardName = `variant-${this.variant._id}`;

    const classNames = classnames({
      "variant-card": true,
      "active": this.isExpanded(cardName)
    });

    const currency = findCurrency(null, true);

    return (
      <Components.CardGroup>
        <Components.Card
          className={classNames}
          expandable={true}
          expanded={this.isExpanded(cardName)}
          name={cardName}
          onExpand={this.handleCardExpand}
        >
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetailEdit.variantDetails"
            title="Variant Details"
            isValid={this.props.validation.isValid}
          >
            {this.renderArchivedLabel()}
            <Components.Button
              icon="files-o"
              className="rui btn btn-default btn-clone-variant flat"
              tooltip="Duplicate"
              onClick={() => this.props.cloneVariant(this.variant)}
            />
            <Components.VisibilityButton
              onClick={() => this.handleVariantVisibilityToggle(this.variant)}
              bezelStyle="flat"
              primary={false}
              toggleOn={this.variant.isVisible}
            />
            {this.renderArchiveButton()}
          </Components.CardHeader>
          <Components.CardBody expandable={true}>
            <Components.TextField
              i18nKeyLabel="productVariant.title"
              i18nKeyPlaceholder="productVariant.title"
              placeholder="Label"
              label="Label"
              name="title"
              ref="titleInput"
              value={this.variant.title}
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              validation={this.props.validation}
            />
            <Components.Select
              clearable={false}
              i18nKeyLabel="productVariant.originCountry"
              i18nKeyPlaceholder="productVariant.originCountry"
              label="Origin Country"
              name="originCountry"
              ref="countryOfOriginInput"
              options={this.props.countries}
              onChange={this.handleSelectChange}
              value={this.variant.originCountry}
            />
            <div className="row">
              <div className="col-sm-6">
                <Components.NumericInput
                  i18nKeyLabel="productVariant.price"
                  i18nKeyPlaceholder="0.00"
                  placeholder="0.00"
                  label="Price"
                  name="price"
                  ref="priceInput"
                  value={this.variant.price}
                  format={currency}
                  numericType="currency"
                  style={this.props.greyDisabledFields(this.variant)}
                  disabled={this.props.hasChildVariants(this.variant)}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.NumericInput
                  i18nKeyLabel="productVariant.compareAtPrice"
                  i18nKeyPlaceholder="0.00"
                  placeholder="0.00"
                  label="Compare At Price"
                  name="compareAtPrice"
                  ref="compareAtPriceInput"
                  value={this.variant.compareAtPrice}
                  numericType="currency"
                  format={currency}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>
            <Components.Divider />
            <div className="row">
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.width"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Width"
                  name="width"
                  ref="widthInput"
                  value={this.variant.width}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.length"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Length"
                  name="length"
                  ref="lengthInput"
                  value={this.variant.length}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.height"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Height"
                  name="height"
                  ref="heightInput"
                  value={this.variant.height}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.weight"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Weight"
                  name="weight"
                  ref="weightInput"
                  value={this.variant.weight}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>
          </Components.CardBody>
        </Components.Card>

        <Components.SettingsCard
          enabled={this.state.isTaxable}
          expandable={true}
          i18nKeyTitle="productVariant.taxable"
          name="isTaxable"
          packageName={"reaction-product-variant"}
          saveOpenStateToPreferences={true}
          showSwitch={true}
          title="Taxable"
          onSwitchChange={this.handleCheckboxChange}
        >
          {this.renderTaxCodeField()}
          <Components.TextField
            i18nKeyLabel="productVariant.taxDescription"
            i18nKeyPlaceholder="productVariant.taxDescription"
            placeholder="Tax Description"
            label="Tax Description"
            name="taxDescription"
            ref="taxDescriptionInput"
            value={this.variant.taxDescription}
            onBlur={this.handleFieldBlur}
            onChange={this.handleFieldChange}
            onReturnKeyDown={this.handleFieldBlur}
            validation={this.props.validation}
          />
        </Components.SettingsCard>

        <Components.SettingsCard
          enabled={this.state.inventoryManagement}
          expandable={true}
          i18nKeyTitle="productVariant.inventoryManagement"
          name="inventoryManagement"
          packageName={"reaction-product-variant"}
          saveOpenStateToPreferences={true}
          showSwitch={true}
          title="Inventory Tracking"
          onSwitchChange={this.handleCheckboxChange}
        >
          <div className="row">
            {this.renderQuantityField()}
            <div className="col-sm-6">
              <Components.TextField
                i18nKeyLabel="productVariant.lowInventoryWarningThreshold"
                i18nKeyPlaceholder="0"
                placeholder="0"
                type="number"
                label="Warn At"
                name="lowInventoryWarningThreshold"
                ref="lowInventoryWarningThresholdInput"
                value={this.variant.lowInventoryWarningThreshold}
                onBlur={this.handleFieldBlur}
                onChange={this.handleFieldChange}
                onReturnKeyDown={this.handleFieldBlur}
                validation={this.props.validation}
              />
            </div>
          </div>
          <div className="row">
            {this.renderInventoryPolicyField()}
          </div>
        </Components.SettingsCard>
      </Components.CardGroup>
    );
  }


  renderOptionFields() {
    const cardName = `variant-${this.variant._id}`;

    const classNames = classnames({
      "variant-option-card": true,
      "active": this.isExpanded(cardName)
    });

    const currency = findCurrency(null, true);

    return (
      <Components.CardGroup>
        <Components.Card
          className={classNames}
          expandable={true}
          expanded={this.isExpanded(cardName)}
          name={cardName}
          onExpand={this.handleCardExpand}
        >
          <Components.CardHeader
            actAsExpander={true}
            title={this.variant.optionTitle || "Label is required"}
            isValid={this.props.validation.isValid}
          >
            {this.renderArchivedLabel()}
            <Components.Button
              icon="files-o"
              className="rui btn btn-default btn-clone-variant flat"
              tooltip="Duplicate"
              onClick={() => this.props.cloneVariant(this.variant)}
            />
            <Components.VisibilityButton
              onClick={() => this.handleVariantVisibilityToggle(this.variant)}
              bezelStyle="flat"
              primary={false}
              toggleOn={this.variant.isVisible}
            />
            {this.renderArchiveButton()}
          </Components.CardHeader>
          <Components.CardBody expandable={true}>
            <Components.TextField
              i18nKeyLabel="productVariant.optionTitle"
              i18nKeyPlaceholder="productVariant.optionTitle"
              placeholder="optionTitle"
              label="Short Label"
              name="optionTitle"
              ref="optionTitleInput"
              value={this.variant.optionTitle}
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              validation={this.props.validation}
              helpText={"Displayed on Product Detail Page"}
              i18nKeyHelpText={"admin.helpText.optionTitle"}
            />
            <Components.TextField
              i18nKeyLabel="productVariant.title"
              i18nKeyPlaceholder="productVariant.title"
              placeholder="Label"
              label="Label"
              name="title"
              ref="titleInput"
              value={this.variant.title}
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              validation={this.props.validation}
              helpText={"Displayed in cart, checkout, and orders"}
              i18nKeyHelpText={"admin.helpText.title"}
            />
            <div className="row">
              <div className="col-sm-6">
                <Components.NumericInput
                  i18nKeyLabel="productVariant.price"
                  i18nKeyPlaceholder="0.00"
                  placeholder="0.00"
                  label="Price"
                  name="price"
                  ref="priceInput"
                  value={this.variant.price}
                  format={currency}
                  numericType="currency"
                  style={this.props.greyDisabledFields(this.variant)}
                  disabled={this.props.hasChildVariants(this.variant)}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                  helpText={"Purchase price"}
                  i18nKeyHelpText={"admin.helpText.price"}
                />
              </div>
              <div className="col-sm-6">
                <Components.NumericInput
                  i18nKeyLabel="productVariant.compareAtPrice"
                  i18nKeyPlaceholder="0.00"
                  placeholder="0.00"
                  label="Compare At Price"
                  name="compareAtPrice"
                  ref="compareAtPriceInput"
                  value={this.variant.compareAtPrice}
                  format={currency}
                  numericType="currency"
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                  helpText={"Original price or MSRP"}
                  i18nKeyHelpText={"admin.helpText.compareAtPrice"}
                />
              </div>
            </div>

            <div className="row">
              {this.renderQuantityField()}
              {this.renderInventoryPolicyField()}
            </div>
            <div className="row">
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.width"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Width"
                  name="width"
                  ref="widthInput"
                  value={this.variant.width}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.length"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Length"
                  name="length"
                  ref="lengthInput"
                  value={this.variant.length}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.height"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Height"
                  name="height"
                  ref="heightInput"
                  value={this.variant.height}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.weight"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Weight"
                  name="weight"
                  ref="weightInput"
                  value={this.variant.weight}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }

  render() {
    if (this.props.type === "option") {
      return (
        <div>
          {this.renderOptionFields()}
        </div>
      );
    }
    return (
      <div>
        {this.renderVariantFields()}
      </div>
    );
  }
}

VariantForm.propTypes = {
  cloneVariant: PropTypes.func,
  countries: PropTypes.arrayOf(PropTypes.object),
  editFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  greyDisabledFields: PropTypes.func,
  hasChildVariants: PropTypes.func,
  isDeleted: PropTypes.bool,
  onCardExpand: PropTypes.func,
  onFieldChange: PropTypes.func,
  onUpdateQuantityField: PropTypes.func,
  onVariantFieldSave: PropTypes.func,
  onVisibilityButtonClick: PropTypes.func,
  removeVariant: PropTypes.func,
  restoreVariant: PropTypes.func,
  taxCodes: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  type: PropTypes.string,
  validation: PropTypes.object,
  variant: PropTypes.object
};

export default VariantForm;
