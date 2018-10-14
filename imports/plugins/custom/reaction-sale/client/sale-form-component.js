import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, withMoment } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";

// function splitDateAndTime(dateAndTime, ignoreDefaults = false) {

//   let [date, time] =
//     (dateAndTime || "").replace(/undefined/g, "").split("T", 2);

//   if (!date && !time && ignoreDefaults) { return []; }

//   if (!date) {
//     const d = new Date();
//     const yyyy = d.getFullYear();
//     const mm = `0${d.getMonth()}`.slice(-2);
//     const dd = `0${d.getDay()}`.slice(-2);
//     date = `${yyyy}-${mm}-${dd}`;
//   }

//   if (!time) {
//     time = "00:00";
//   } else if (time[time.length - 1] === "Z") {
//     time = time.replace(/Z$/, "");
//   }

//   return [date, time];
// }

function convertToUtcDate(dateString) {
  const d = new Date(Date.parse(dateString));

  const offset = (new Date().getTimezoneOffset() / 60);

  return new Date(d.getTime() - offset);
}

class SaleFormComponent extends Component {
  static propTypes = {
    cancel: PropTypes.func,
    editSale: PropTypes.object,
    hasSale: PropTypes.bool,
    moment: PropTypes.func,
    onSave: PropTypes.func,
    sale: PropTypes.shape({
      _id: PropTypes.string,
      headline: PropTypes.string,
      slug: PropTypes.string,
      description: PropTypes.string,
      instructions: PropTypes.string,
      beginsAt: PropTypes.date,
      endsAt: PropTypes.date,
      isDemo: PropTypes.bool,
      isVisible: PropTypes.bool
    })
  };

  constructor(props) {
    super(props);

    Reaction.getSlug(); // trigger lazy loading of slugify package

    const { sale = {} } = props;
    const {
      _id,
      slug,
      headline,
      description,
      instructions,
      beginsAt,
      endsAt,
      isDemo,
      isVisible
    } = sale;

    const [beginsAtDate, beginsAtTime] = this.splitDateAndTime(beginsAt, true);
    const [endsAtDate, endsAtTime] = this.splitDateAndTime(endsAt, true);

    this.state = {
      regions: [],
      fields: {
        _id,
        headline,
        slug,
        description,
        instructions,
        beginsAt: `${beginsAtDate}T${beginsAtTime}`,
        beginsAtDate,
        beginsAtTime,
        endsAt: `${endsAtDate}T${endsAtTime}`,
        endsAtDate,
        endsAtTime,
        isDemo,
        isVisible
      }
    };

    this.isUpdate = !!_id;
    this.slugCanChangeWithHeadline = !slug;
  }

  state = {};

  fieldLabelMap = {
    _id: {},
    headline: {
      label: "Headline",
      i18nKeyLabel: "sale.headline",
      i18nKeyHelpText: "sale.help.headline",
      required: true
    },
    slug: {
      label: "URL Slug",
      i18nKeyLabel: "sale.slug",
      helpText: (value) => {
        // TODO: this will not work for i18n
        if (value) {
          const path = Router.pathFor("sale", { idOrSlug: value });
          return `URL: ${path}`;
        }

        return "Create a URL that is readable. (helps with Google searches)";
      },
      i18nKeyHelpText: "sale.help.slug",
      required: true
    },
    description: {
      label: "Description",
      i18nKeyLabel: "sale.description",
      helpText: "Describe this can release. It is typically best to tell a story that customer can re-tell their friends!",
      i18nKeyHelpText: "sale.help.description",
      placeholder: "It was a clear black night, a clear while moon..."
    },
    instructions: {
      label: "Instructions",
      i18nKeyLabel: "sale.instructions",
      helpText: "Message to customers once purchase is complete. i.e., Pickup Instructions",
      i18nKeyHelpText: "sale.help.instructions"
    },
    beginsAt: {
      label: "Begins at",
      i18nKeyLabel: "sale.beginsAt",
      helpText: "Date/Time at which you want to begin taking orders on the site",
      i18nKeyHelpText: "sale.help.beginsAt",
      required: true
    },
    beginsAtDate: {
      partial: true
    },
    beginsAtTime: {
      partial: true
    },
    endsAt: {
      label: "Ends at",
      i18nKeyLabel: "sale.endsAt",
      helpText: "Deadline for taking orders on the site",
      i18nKeyHelpText: "sale.help.endsAt",
      required: true
    },
    endsAtDate: {
      partial: true
    },
    endsAtTime: {
      partial: true
    },
    isDemo: {
      label: "For demo purposes",
      i18nKeyLabel: "sale.isDemo"
    },
    isVisible: {
      label: "Publicly visible",
      i18nKeyLabel: "sale.isVisible",
      helpText: "Keep this sale hidden until you are ready for the public to see it",
      i18nKeyHelpText: "sale.help.isVisible"
    }
  }

  splitDateAndTime(dateAndTime, ignoreDefaults = false) {
    const { moment } = this.props;

    if (!moment) { return []; }

    const mDate = moment(dateAndTime);

    let date = mDate.format("YYYY-MM-dd");
    let time = mDate.format("HH:mm");

    if (!date && !time && ignoreDefaults) { return []; }

    if (!date) {
      date = moment().format("YYYY-MM-dd");
    }

    if (!time) {
      time = "00:00";
    }

    return [date, time];
  }

  clientValidation = (formData) => {
    const validation = { messages: {} };
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldDefinition = this.fieldLabelMap[key] || {};

      if (formData[key] && typeof formData[key] === "string" && fieldDefinition.required) {
        formData[key] = formData[key].trim();
      }
      if (fieldDefinition.required && !formData[key]) {
        validation.messages[key] = {
          message: `${this.fieldLabelMap[key].label} is required`
        };
        isValid = false;
      }
    });

    if (!isValid) {
      this.setState({
        validation
      });
    } else {
      this.setState({
        validation: undefined
      });
    }

    return isValid;
  }

  onSubmit = (event) => {
    event.preventDefault();
    const { onSave } = this.props;
    const { fields } = this.state;

    if (!this.clientValidation(fields)) { return; }

    const formData = {};
    Object.keys(fields).forEach((key) => {
      const fieldDefinition = this.fieldLabelMap[key];

      if (!fieldDefinition || fieldDefinition.partial) { return; }

      formData[key] = fields[key];
    });

    const { beginsAt, endsAt } = formData;

    if (beginsAt) {
      formData.beginsAt = convertToUtcDate(beginsAt);
    }

    if (endsAt) {
      formData.endsAt = convertToUtcDate(endsAt);
    }

    onSave(formData);
  }

  handleDatesChange = (beginsAt, endsAt) => {
    this.setState({
      beginsAt,
      endsAt,
      classNames: { ...this.state.classNames, date: "active" }
    });
  }

  setDefaultSlug(value) {
    const { fields } = this.state;

    // already have a slug? bail.
    if (!this.slugCanChangeWithHeadline || this.isUpdate) { return; }

    // nothing to set? bail.
    if (!value) { return; }

    fields.slug = Reaction.getSlug(value);
    this.setState({ fields });
  }

  onFieldChange = (_event, value, name) => {
    const { fields } = this.state;

    fields[name] = value;

    if (name === "beginsAtDate") {
      const time = this.splitDateAndTime(fields.beginsAt)[1];
      fields.beginsAt = `${value}T${time}`;
    } else if (name === "beginsAtTime") {
      const date = this.splitDateAndTime(fields.beginsAt)[0];
      fields.beginsAt = `${date}T${value}`;
    } else if (name === "endsAtDate") {
      const time = this.splitDateAndTime(fields.endsAt)[1];
      fields.endsAt = `${value}T${time}`;
    } else if (name === "endsAtTime") {
      const date = this.splitDateAndTime(fields.endsAt)[0];
      fields.endsAt = `${date}T${value}`;
    } else if (name === "slug") {
      this.slugCanChangeWithHeadline = false;
    }

    this.setState({ fields });
  }

  getInputProps(key, keyOverrides = {}) {
    let helpText;
    let placeholder;
    const { fields, validation } = this.state;
    const fieldLabelMap = this.fieldLabelMap[key];

    if (!fieldLabelMap) { return; }

    const {
      helpText: helpTextFnOrString,
      i18nKeyHelpText,
      i18nKeyLabel,
      label,
      placeholder: placeholderFnOrString
    } = fieldLabelMap;

    let value = fields[key];
    if (value && value.toISOString) {
      value = value.toISOString();
    }
    if (placeholderFnOrString && placeholderFnOrString.call) {
      placeholder = placeholderFnOrString(value);
    } else {
      placeholder = placeholderFnOrString;
    }
    if (helpTextFnOrString && helpTextFnOrString.call) {
      helpText = helpTextFnOrString(value);
    } else {
      helpText = helpTextFnOrString;
    }

    return {
      helpText,
      i18nKeyHelpText,
      i18nKeyLabel,
      label,
      name: key,
      onChange: this.onFieldChange,
      placeholder,
      [keyOverrides[key] || "value"]: fields[key],
      validation
    };
  }

  renderButtons() {
    const { cancel, hasSale } = this.props;
    let cancelButton;

    if (hasSale) {
      cancelButton = (
        <Components.Button
          buttonType="reset"
          className="btn btn-default"
          bezelStyle="solid"
          onClick={cancel}
          i18nKeyLabel="app.cancel"
          label="Cancel"
        />
      );
    }

    return (
      <div className="row text-right">
        <Components.Button
          buttonType="submit"
          className="btn btn-primary"
          bezelStyle="solid"
          i18nKeyLabel="app.saveAndContinue"
          label="Save and continue"
        />
        {cancelButton}
      </div>
    );
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <Components.TextField
          {...this.getInputProps("headline")}
          onBlur={(_e, v) => this.setDefaultSlug(v)}
        />

        <Components.TextField
          {...this.getInputProps("slug")}
          tabIndex={0}
        />

        <Components.TextField
          {...this.getInputProps("description")}
          multiline={true}
        />

        <Components.TextField
          {...this.getInputProps("instructions")}
          multiline={true}
        />

        <div className="rui textfield form-group">
          <label>
            <Components.Translation
              defaultValue={this.fieldLabelMap.beginsAt.label}
              i18nKey={this.fieldLabelMap.beginsAt.i18nKeyLabel}
            />
            {this.state.fields.beginsAt && (
              <span className="disclaimer"> ({this.state.fields.beginsAt})</span>
            )}
          </label>

          <div className="flex flex-nowrap">
            <Components.TextField
              {...this.getInputProps("beginsAtDate")}
              type="date"
            />

            <Components.TextField
              {...this.getInputProps("beginsAtTime")}
              type="time"
            />
          </div>

          <span className="help-block">
            <Components.Translation
              defaultValue={this.fieldLabelMap.beginsAt.helpText}
              i18nKey={this.fieldLabelMap.beginsAt.i18nKeyHelpText}
            />
          </span>
        </div>

        <div className="rui textfield form-group">
          <label>
            <Components.Translation
              defaultValue={this.fieldLabelMap.endsAt.label}
              i18nKey={this.fieldLabelMap.endsAt.i18nKeyLabel}
            />
            {this.state.fields.endsAt && (
              <span className="disclaimer"> ({this.state.fields.endsAt})</span>
            )}
          </label>

          <div className="flex flex-nowrap">
            <Components.TextField
              {...this.getInputProps("endsAtDate")}
              type="date"
            />

            <Components.TextField
              {...this.getInputProps("endsAtTime")}
              type="time"
            />
          </div>

          <span className="help-block">
            <Components.Translation
              defaultValue={this.fieldLabelMap.endsAt.helpText}
              i18nKey={this.fieldLabelMap.endsAt.i18nKeyHelpText}
            />
          </span>
        </div>

        <Components.Checkbox
          {...this.getInputProps("isVisible", { value: "checked" })}
        />

        {this.renderButtons()}
      </form>
    );
  }
}

export default withMoment(SaleFormComponent);
