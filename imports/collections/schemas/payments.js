import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { Address } from "./address";

/**
 * @name Invoice
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {Number} discounts optional
 * @property {Number} effectiveTaxRate The effective tax rate, for display
 * @property {Number} shipping optional
 * @property {Number} subtotal required
 * @property {Number} taxes optional
 * @property {Number} total required
 */
export const Invoice = new SimpleSchema({
  discounts: {
    type: Number,
    min: 0
  },
  effectiveTaxRate: {
    type: Number,
    min: 0
  },
  shipping: {
    type: Number,
    min: 0
  },
  subtotal: {
    type: Number,
    min: 0
  },
  taxes: {
    type: Number,
    min: 0
  },
  total: {
    type: Number,
    min: 0,
    exclusiveMin: true
  }
});

registerSchema("Invoice", Invoice);

/**
 * @name CurrencyExchangeRate
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} userCurrency, default value: `"USD"`
 * @property {Number} exchangeRate optional
 */
export const CurrencyExchangeRate = new SimpleSchema({
  userCurrency: {
    type: String,
    optional: true,
    defaultValue: "USD"
  },
  exchangeRate: {
    type: Number,
    optional: true
  }
});

registerSchema("CurrencyExchangeRate", CurrencyExchangeRate);

/**
 * @name Payment
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} _id Payment ID
 * @property {Address} [address] Billing address
 * @property {Number} amount The amount paid or authorized
 * @property {String} [cardBrand] The brand of card, if the payment method was a credit card
 * @property {CurrencyExchangeRate} [currency] The exchange rate, if the user's currency is different from shop's
 * @property {Object} [data] Arbitrary data that the payment method needs
 * @property {Invoice} invoice A summary of the totals that make up the full charge amount. Created when the payment is added to an order.
 * @property {String} shopId The ID of the shop that is being paid. This might be a merchant shop in a marketplace setup.
 */
export const Payment = new SimpleSchema({
  "_id": {
    type: String,
    label: "Payment Id"
  },
  "address": {
    type: Address,
    optional: true
  },
  "amount": Number,
  "cardBrand": {
    type: String,
    optional: true
  },
  "createdAt": Date,
  "currency": {
    type: CurrencyExchangeRate,
    optional: true
  },
  "currencyCode": String,
  "data": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "displayName": String,
  "invoice": Invoice,
  "method": String,
  "mode": String,
  "name": String,
  "paymentPluginName": String,
  "processor": String,
  "riskLevel": {
    type: String,
    optional: true
  },
  "shopId": String,
  "status": String,
  "transactionId": String,
  "transactions": {
    type: Array
  },
  "transactions.$": {
    type: Object,
    blackbox: true
  }
});

registerSchema("Payment", Payment);

/**
 * @name Payment
 * @type {SimpleSchema}
 * @memberof Schemas
 * @property {String} type required
 * @property {Number} amount required
 * @property {Number} created required
 * @property {String} currency required
 * @property {Object} raw optional, blackbox
 */
export const Refund = new SimpleSchema({
  type: {
    type: String
  },
  amount: {
    type: Number
  },
  created: {
    type: SimpleSchema.Integer
  },
  currency: {
    type: String
  },
  raw: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

registerSchema("Refund", Refund);
