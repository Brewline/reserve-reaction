import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { withComponents } from "@reactioncommerce/components-context";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
import { Components, registerComponent, withMoment } from "@reactioncommerce/reaction-components";
import { formatPriceString, i18next } from "/client/api";
import LineItems from "./lineItems";
import OrderPayment from "./OrderPayment";

/**
 * @file Invoice is a React Component for displaying the `invoice` section on the orders sideview
 * @module Invoice
 * @extends Components
 */

class Invoice extends Component {
  static propTypes = {
    /**
     * A boolean indicating whether adjustments could be made on total payment
     */
    canMakeAdjustments: PropTypes.bool,
    /**
     * If you've set up a components context using
     * [@reactioncommerce/components-context](https://github.com/reactioncommerce/components-context)
     * (recommended), then this prop will come from there automatically. If you have not
     * set up a components context or you want to override one of the components in a
     * single spot, you can pass in the components prop directly.
     */
    components: PropTypes.shape({
      /**
       * Button component used for payment buttons
       */
      Button: CustomPropTypes.component.isRequired
    }),
    /**
     * Currency details for the current shop
     */
    currency: PropTypes.object,
    /**
     * A boolean indicating whether discounts are enabled
     */
    discounts: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    /**
     * Function that renders media
     */
    displayMedia: PropTypes.func,
    /**
     * An order invoice document
     */
    invoice: PropTypes.object,
    /**
     * Set true when currently capturing a payment
     */
    isCapturing: PropTypes.bool,
    /**
     * Is the refund list being loaded
     */
    isFetching: PropTypes.bool,
    /**
     * True while a refund is being created
     */
    isRefunding: PropTypes.bool,
    /**
     * Injected MomentJS library
     */
    moment: PropTypes.func,
    /**
     * Function to be called when "Approve" is clicked for a payment
     */
    onApprovePayment: PropTypes.func.isRequired,
    /**
     * Function to be called when "Cancel Order" is clicked
     */
    onCancelOrder: PropTypes.func.isRequired,
    /**
     * Function to be called when "Capture" is clicked for a payment
     */
    onCapturePayment: PropTypes.func.isRequired,
    /**
     * Function to be called when a refund is requested for a payment
     */
    onRefundPayment: PropTypes.func.isRequired,
    /**
     * An order document
     */
    order: PropTypes.object,
    /**
     * List of payment methods defined for the shop that owns this order
     */
    paymentMethods: PropTypes.arrayOf(PropTypes.object),
    /**
     * A string representing the route/path for printed order
     */
    printOrder: PropTypes.string,
    /**
     * A list of refunds for this payment
     */
    refunds: PropTypes.array
  }

  state = {
    isOpen: false
  }

  /**
    * @name formatDate
    * @method
    * @summary Formats dates
    * @param {Number} context - the date to be formatted
    * @param {String} block - the preferred format
    * @returns {String} formatted date
    */
  formatDate(context, block) {
    const { moment } = this.props;
    const dateFormat = block || "MMM DD, YYYY hh:mm:ss A";
    return (moment && moment(context).format(dateFormat)) || context.toLocaleString();
  }

  /**
    * @name handleClick
    * @method
    * @summary Handle clicking the add discount link
    * @param {Event} event - the event that fired
    * @returns {null} null
    */
  handleClick = (event) => {
    event.preventDefault();
    this.setState({
      isOpen: true
    });
  }

  /**
    * @name renderDiscountForm
    * @method
    * @summary Displays the discount form
    * @returns {null} null
    */
  renderDiscountForm() {
    return (
      <div>
        {this.state.isOpen &&
          <div>
            <hr/>
            <Components.DiscountList
              id={this.props.order._id}
              collection="Orders"
              validatedInput={true}
            />
            <hr/>
          </div>
        }
      </div>
    );
  }

  /**
    * @name renderRefundsInfo
    * @method
    * @summary Displays the refund information after the order payment breakdown on the invoice
    * @returns {null} null
    */
  renderRefundsInfo() {
    const { isFetching, refunds } = this.props;
    return (
      <div>
        {(isFetching) &&
          <div className="form-group order-summary-form-group">
            <strong>Loading Refunds</strong>
            <div className="invoice-details">
              <i className="fa fa-spinner fa-spin" />
            </div>
          </div>
        }

        {Array.isArray(refunds) && refunds.map((refund) => (
          <div className="order-summary-form-group text-danger" key={refund.created} style={{ marginBottom: 15 }}>
            <strong>Refunded on: {this.formatDate(refund.created, "MM/D/YYYY")}</strong>
            <div className="invoice-details"><strong>{formatPriceString(refund.amount)}</strong></div>
          </div>
        ))}
      </div>
    );
  }

  /**
    * @name renderSurcharge
    * @method
    * @summary Displays the surcharge amount from the invoice, if available
    * @returns {null} null
    */
  renderSurcharge() {
    const { invoice: { surcharges } } = this.props;

    if (surcharges) {
      return (
        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Surcharge" i18nKey="cartSubTotals.surcharge"/></strong>
          <div className="invoice-details">
            {formatPriceString(surcharges)}
          </div>
        </div>
      );
    }

    return null;
  }

  /**
    * @name renderTotal
    * @method
    * @summary Displays the total payment form
    * @returns {null} null
    */
  renderTotal() {
    return (
      <div className="order-summary-form-group">
        <hr/>
        <strong>TOTAL</strong>
        <div className="invoice-details">
          <strong>{formatPriceString(this.props.invoice.total)}</strong>
        </div>
      </div>
    );
  }

  /**
    * @name renderInvoice
    * @method
    * @summary Displays the invoice form with broken down payment info
    * @returns {null} null
    */
  renderInvoice() {
    const { invoice, discounts } = this.props;

    return (
      <div>
        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Items in order" i18nKey="cartSubTotals.orderItems" /></strong>
          <div className="invoice-details">
            {invoice.totalItems}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.subtotal)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.shipping)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Components.Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.taxes)}
          </div>
        </div>

        {discounts &&
          <div>
            <div className="order-summary-form-group">
              <strong><Components.Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
              <div className="invoice-details">
                {formatPriceString(invoice.discounts)}
              </div>
            </div>
            {this.renderDiscountForm()}
          </div>
        }
        {this.renderSurcharge()}
        {this.renderTotal()}
        {this.renderRefundsInfo()}
      </div>
    );
  }

  renderPayments() {
    const {
      currency,
      isCapturing,
      isRefunding,
      onApprovePayment,
      onCapturePayment,
      onRefundPayment,
      order,
      paymentMethods = [],
      refunds = []
    } = this.props;

    return order.payments.map((payment) => {
      const refundsForPayment = refunds.filter((refund) => refund.paymentId === payment._id);
      const paymentMethod = paymentMethods.find((method) => method.name === payment.name);

      return (
        <OrderPayment
          currency={currency}
          key={payment._id}
          isCapturing={isCapturing}
          isRefunding={isRefunding}
          onApprovePayment={onApprovePayment}
          onCapturePayment={onCapturePayment}
          onRefundPayment={onRefundPayment}
          payment={payment}
          paymentMethod={paymentMethod}
          refunds={refundsForPayment}
        />
      );
    });
  }

  render() {
    const { components: { Button }, onCancelOrder, order, printOrder } = this.props;

    const canCancelOrder = (order.workflow.status !== "coreOrderWorkflow/canceled");

    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardHeader
            actAsExpander={false}
            i18nKeyTitle="admin.orderWorkflow.invoice.cardTitle"
            title="Invoice"
          />
          <Components.CardBody expandable={false}>
            <LineItems {...this.props} />

            <div>
              {this.renderInvoice()}
            </div>

            <div className="invoice-actions-container">
              {!!printOrder && <div>
                <a
                  className="btn btn-default"
                  href={printOrder}
                  target="_blank"
                  data-i18n="app.printInvoice"
                >
                  Print Invoice
                </a>
              </div>}

              {canCancelOrder &&
                <Button
                  actionType="danger"
                  onClick={onCancelOrder}
                >
                  {i18next.t("order.cancelOrderLabel")}
                </Button>
              }
            </div>

            <h3>Payments</h3>
            {this.renderPayments()}
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

registerComponent("Invoice", Invoice, [
  withMoment,
  withComponents
]);

export default compose(
  withMoment,
  withComponents
)(Invoice);
