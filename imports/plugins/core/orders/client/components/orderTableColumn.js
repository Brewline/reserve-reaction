import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { formatPriceString, i18next } from "/client/api";
import Avatar from "react-avatar";
import { withMoment } from "@reactioncommerce/reaction-components";
import { Badge, ClickToCopy, Icon, RolloverCheckbox, Checkbox } from "@reactioncommerce/reaction-ui";
import { getOrderRiskBadge, getOrderRiskStatus, getPaymentForCurrentShop, getTaxRiskStatus } from "../helpers";

class OrderTableColumn extends Component {
  static propTypes = {
    fulfillmentBadgeStatus: PropTypes.func,
    handleClick: PropTypes.func,
    handleSelect: PropTypes.func,
    moment: PropTypes.func,
    row: PropTypes.object,
    selectedItems: PropTypes.array
  }

  renderCheckboxOnSelect(row) {
    if (this.props.selectedItems.length) {
      return (
        <div className="all-checkboxes">
          <Checkbox
            className="checkbox-large checkbox-avatar"
            name={row.original._id}
            onChange={this.props.handleSelect}
            checked={this.props.selectedItems.includes(row.original._id)}
          />
        </div>
      );
    }
    return (
      <RolloverCheckbox
        checkboxClassName="checkbox-avatar checkbox-large"
        name={row.original._id}
        onChange={this.props.handleSelect}
        checked={this.props.selectedItems.includes(row.original._id)}
      >
        <Avatar
          email={row.original.email}
          round={true}
          name={row.value}
          size={30}
          className="rui-order-avatar"
        />
      </RolloverCheckbox>
    );
  }

  render() {
    const { moment, row } = this.props;
    const { original: order } = row;
    const columnAccessor = row.column.id;
    const { invoice } = getPaymentForCurrentShop(order);
    const orderPaymentRisk = getOrderRiskStatus(order);
    const orderTaxRisk = getTaxRiskStatus(order);
    const orderRisk = orderPaymentRisk || orderTaxRisk;

    if (columnAccessor === "shippingFullName") {
      return (
        <div style={{ display: "inline-flex" }}>
          {this.renderCheckboxOnSelect(row)}
          <strong className="orders-full-name">
            {row.value}
            {orderRisk &&
              <Badge
                className="risk-info"
                i18nKeyLabel={`admin.orderRisk.${orderRisk}`}
                status={getOrderRiskBadge(orderRisk)}
              />
            }
          </strong>
        </div>
      );
    }
    if (columnAccessor === "email") {
      return (
        <div style={{ marginTop: 7 }}>{row.value}</div>
      );
    }
    if (columnAccessor === "createdAt") {
      const createdDate = (moment && moment(row.value).format("MM/D/YYYY")) || row.value.toLocaleString();
      return (
        <div style={{ marginTop: 7 }}>{createdDate}</div>
      );
    }
    if (columnAccessor === "_id") {
      const id = order._id;
      const truncatedId = id.substring(0, 4);
      return (
        <div style={{ marginTop: 7 }}>
          <ClickToCopy
            copyToClipboard={id}
            displayText={truncatedId}
            i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
            tooltip="Copy Order Link"
          />
        </div>
      );
    }
    if (columnAccessor === "billingTotal") {
      return (
        <div style={{ marginTop: 7 }}>
          <strong>{formatPriceString(invoice.total)}</strong>
        </div>
      );
    }
    if (columnAccessor === "shippingStatus") {
      return (
        <Badge
          className="orders-badge"
          badgeSize="large"
          i18nKeyLabel={`admin.table.data.status.${row.value}`}
          label={row.value}
          status="basic"
        />
      );
    }
    if (columnAccessor === "workflow.status") {
      return (
        <div className="status-info">
          <Badge
            badgeSize="large"
            i18nKeyLabel={`admin.table.data.status.${row.value}`}
            label={row.value}
            status={this.props.fulfillmentBadgeStatus(order)}
          />
        </div>
      );
    }
    if (columnAccessor === "") {
      const startWorkflow = order.workflow.status === "new";
      const classes = classnames({
        "rui": true,
        "btn": true,
        "btn-success": startWorkflow
      });
      const chevronDirection = i18next.dir() === "rtl" ? "left" : "right";

      return (
        <button className={classes} onClick={() => this.props.handleClick(order, startWorkflow)}>
          <Icon icon={`fa fa-chevron-${chevronDirection}`} />
        </button>
      );
    }
    return (
      <span>{row.value}</span>
    );
  }
}

export default withMoment(OrderTableColumn);
