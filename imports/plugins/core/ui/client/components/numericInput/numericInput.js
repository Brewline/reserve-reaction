import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import accounting from "accounting-js";
import { registerComponent } from "@reactioncommerce/reaction-components";

function setCaretPosition(ctrl, pos) {
  if (ctrl.setSelectionRange) {
    ctrl.focus();
    ctrl.setSelectionRange(pos, pos);
  } else if (ctrl.createTextRange) {
    const range = ctrl.createTextRange();

    range.collapse(true);
    range.moveEnd("character", pos);
    range.moveStart("character", pos);
    range.select();
  }
}

class NumericInput extends Component {
  constructor(props) {
    super(props);

    // Set default state
    this.state = {
      value: this.props.value
    };

    // Bind event handlers
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * update state when component receives props
   * @param  {Object} nextProps new props
   * @return {undefined}
   */
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  get moneyFormat() {
    const moneyFormat = this.props.format || {};
    // precision is mis-represented in accounting.js. Precision in this case is actually scale
    // so we add the property for precision based on scale.
    moneyFormat.precision = moneyFormat.scale !== undefined ? moneyFormat.scale : 2;

    return moneyFormat;
  }

  get displayValue() {
    const { value } = this.state;

    if (typeof value === "number") {
      if (this.props.format && this.props.format.scale === 0) {
        return this.format(value * 100);
      }
      return this.format(value);
    }

    return 0;
  }

  get scale() {
    const parts = this.state.value.split(".");

    if (parts.length === 2) {
      return parts[1].length;
    }

    return 0;
  }

  /**
   * format a numeric string
   * @param  {String} value Value to format
   * @param  {Object} format Object containing settings for formatting value
   * @return {String} Foramtted numeric string
   */
  format(value, format) {
    const moneyFormat = format || this.moneyFormat;

    const decimal = moneyFormat.decimal || undefined;
    const unformatedValue = this.unformat(value, decimal);

    return accounting.formatMoney(unformatedValue, moneyFormat);
  }

  /**
   * unformat numeric string
   * @param  {String} value String value to unformat
   * @param  {String} decimal String representing the decimal place
   * @return {String} unformatted numeric string
   */
  unformat(value, decimal) {
    return accounting.unformat(value, decimal);
  }

  /**
   * Handle change event from text input
   * @param  {SyntheticEvent} event Change event
   * @return {undefined}
   */
  handleChange(event) {
    const input = event.currentTarget;
    const { value } = event.currentTarget;
    let numberValue = this.unformat(value);

    if (this.props.format.scale === 0) {
      numberValue /= 100;
    }

    this.setState({
      value: numberValue,
      caretPosition: input.selectionStart
    }, () => {
      setCaretPosition(input, Math.max(this.state.caretPosition, 0));

      if (this.props.onChange) {
        this.props.onChange(event, { value, numberValue });
      }
    });
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const { classNames } = this.props;


    if (this.props.isEditing === false) {
      const textValueClassName = classnames({
        rui: true,
        text: true,
        ...(classNames.text || {})
      });

      return (
        <span className={textValueClassName}>
          {this.displayValue}
        </span>
      );
    }

    const fieldClassName = classnames({
      "form-control": true, // eslint-disable-line: quote-props
      ...(classNames.input || {})
    });

    return (
      <div className="rui control numeric-input">
        <input
          className={fieldClassName}
          disabled={this.props.disabled}
          onChange={this.handleChange}
          value={this.displayValue}
        />
      </div>
    );
  }
}

NumericInput.defaultProps = {
  disabled: false,
  isEditing: true,
  classNames: {}
};

NumericInput.propTypes = {
  classNames: PropTypes.shape({}),
  disabled: PropTypes.bool,
  format: PropTypes.shape({
    scale: PropTypes.number
  }),
  isEditing: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.number
};

registerComponent("NumericInput", NumericInput);

export default NumericInput;
