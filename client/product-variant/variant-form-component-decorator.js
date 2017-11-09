import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";
import VariantForm from "/imports/plugins/included/product-variant/components/variantForm";
import { formatPriceString } from "/client/api";

class InventoryLimitVariantForm extends VariantForm {
  constructor(props) {
    super(props);
  }

  renderInventoryLimitField() {
    if (this.props.hasChildVariants(this.variant)) {
      return (
        <div className="col-sm-6">
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryLimit"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="Limit"
            name="inventoryLimit"
            ref="inventoryLimitInput"
            value={this.props.onUpdateInventoryLimitField(this.variant)}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
            disabled={true}
            helpText={"Variant inventory is now controlled by options"}
            i18nKeyHelpText={"admin.helpText.variantInventoryLimit"}
          />
        </div>
      );
    }

    return (
      <div className="col-sm-6">
        <Components.TextField
          i18nKeyLabel="productVariant.inventoryLimit"
          i18nKeyPlaceholder="0"
          placeholder="0"
          label="Limit"
          name="inventoryLimit"
          ref="inventoryLimitInput"
          value={this.variant.inventoryLimit}
          onChange={this.handleFieldChange}
          onBlur={this.handleFieldBlur}
          onReturnKeyDown={this.handleFieldBlur}
          validation={this.props.validation}
          helpText={"Option limit"}
          i18nKeyHelpText={"admin.helpText.inventoryLimit"}
        />
      </div>
    );
  }

  // It breaks my heart to have to copy/paste all this code just to insert
  // a field, but cest le vie, I suppose.
  renderVariantFields() {
    const cardName = `variant-${this.variant._id}`;

    const classNames = classnames({
      "variant-card": true,
      "active": this.isExpanded(cardName)
    });

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
                <Components.TextField
                  i18nKeyLabel="productVariant.price"
                  i18nKeyPlaceholder={formatPriceString("0.00")}
                  placeholder={formatPriceString("0.00")}
                  label="Price"
                  name="price"
                  ref="priceInput"
                  value={this.variant.price}
                  style={this.props.greyDisabledFields(this.variant)}
                  disabled={this.props.hasChildVariants(this.variant)}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.compareAtPrice"
                  i18nKeyPlaceholder={formatPriceString("0.00")}
                  placeholder={formatPriceString("0.00")}
                  label="Compare At Price"
                  name="compareAtPrice"
                  ref="compareAtPriceInput"
                  value={this.variant.compareAtPrice}
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
          enabled={this.state.taxable}
          expandable={true}
          i18nKeyTitle="productVariant.taxable"
          name="taxable"
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

          {/*
            begin custom code
            all other code is copy/paste
          */}
          <div className="row">
            {this.renderInventoryLimitField()}
          </div>
          {/* end custom code */}

          <div className="row">
            {this.renderInventoryPolicyField()}
          </div>
        </Components.SettingsCard>
      </Components.CardGroup>
    );
  }

  // it further breaks my heart to copy/paste all of this code
  renderOptionFields() {
    const cardName = `variant-${this.variant._id}`;

    const classNames = classnames({
      "variant-option-card": true,
      "active": this.isExpanded(cardName)
    });

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
                <Components.TextField
                  i18nKeyLabel="productVariant.price"
                  i18nKeyPlaceholder={formatPriceString("0.00")}
                  placeholder={formatPriceString("0.00")}
                  label="Price"
                  name="price"
                  ref="priceInput"
                  value={this.variant.price}
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
                <Components.TextField
                  i18nKeyLabel="productVariant.compareAtPrice"
                  i18nKeyPlaceholder={formatPriceString("0.00")}
                  placeholder={formatPriceString("0.00")}
                  label="Compare At Price"
                  name="compareAtPrice"
                  ref="compareAtPriceInput"
                  value={this.variant.compareAtPrice}
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

            {/*
              begin custom code
              all other code is copy/paste
            */}
            <div className="row">
              {this.renderInventoryLimitField()}
            </div>
            {/* end custom code */}

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
}

InventoryLimitVariantForm.propTypes.onUpdateLimitField = PropTypes.func;

export default InventoryLimitVariantForm;
