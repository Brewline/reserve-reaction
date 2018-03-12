/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
// reaction modules
import { Reaction, Logger } from "/server/api";
import { ExampleApi } from "./exampleapi";

function luhnValid(x) {
  return [...x].reverse().reduce((sum, c, i) => {
    let d = parseInt(c, 10);
    if (i % 2 !== 0) { d *= 2; }
    if (d > 9) { d -= 9; }
    return sum + d;
  }, 0) % 10 === 0;
}

const ValidCardNumber = Match.Where((x) => /^[0-9]{13,16}$/.test(x) && luhnValid(x));

const ValidExpireMonth = Match.Where((x) => /^[0-9]{1,2}$/.test(x));

const ValidExpireYear = Match.Where((x) => /^[0-9]{4}$/.test(x));

const ValidCVV = Match.Where((x) => /^[0-9]{3,4}$/.test(x));

// function chargeObj() {
//   return {
//     amount: "",
//     currency: "",
//     card: {},
//     capture: true
//   };
// }

// function parseCardData(data) {
//   return {
//     number: data.number,
//     name: data.name,
//     cvc: data.cvv2,
//     expireMonth: data.expire_month,
//     expireYear: data.expire_year
//   };
// }


Meteor.methods({
  /**
   * Submit a card for Authorization
   * @param  {Object} transactionType authorize or capture
   * @param  {Object} cardData card Details
   * @param  {Object} paymentData The details of the Payment Needed
   * @return {Object} results normalized
   */
  "exampleSubmit"(transactionType, cardData, paymentData) {
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: ValidCardNumber,
      expireMonth: ValidExpireMonth,
      expireYear: ValidExpireYear,
      cvv2: ValidCVV,
      type: String
    });

    check(paymentData, {
      total: String,
      currency: String
    });
    const total = parseFloat(paymentData.total);
    let result;
    try {
      const transaction = ExampleApi.methods.authorize.call({
        transactionType,
        cardData,
        paymentData
      });

      result = {
        saved: true,
        status: "created",
        currency: paymentData.currency,
        amount: total,
        riskLevel: normalizeRiskLevel(transaction),
        transactionId: transaction.id,
        response: {
          amount: total,
          transactionId: transaction.id,
          currency: paymentData.currency
        }
      };
    } catch (error) {
      Logger.warn(error);
      result = {
        saved: false,
        error
      };
    }
    return result;
  },

  /**
   * Capture a Charge
   * @param {Object} paymentData Object containing data about the transaction to capture
   * @return {Object} results normalized
   */
  "example/payment/capture"(paymentData) {
    check(paymentData, Reaction.Schemas.PaymentMethod);
    const authorizationId = paymentData.transactionId;
    const { amount } = paymentData;
    const response = ExampleApi.methods.capture.call({
      authorizationId,
      amount
    });
    const result = {
      saved: true,
      response
    };
    return result;
  },

  /**
   * Create a refund
   * @param  {Object} paymentMethod object
   * @param  {Number} amount The amount to be refunded
   * @return {Object} result
   */
  "example/refund/create"(paymentMethod, amount) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);
    const { transactionId } = paymentMethod;
    const response = ExampleApi.methods.refund.call({
      transactionId,
      amount
    });
    const results = {
      saved: true,
      response
    };
    return results;
  },

  /**
   * List refunds
   * @param  {Object} paymentMethod Object containing the pertinant data
   * @return {Object} result
   */
  "example/refund/list"(paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    const { transactionId } = paymentMethod;
    const response = ExampleApi.methods.refunds.call({
      transactionId
    });
    const result = [];
    for (const refund of response.refunds) {
      result.push(refund);
    }

    // The results retured from the GenericAPI just so happen to look like exactly what the dashboard
    // wants. The return package should ba an array of objects that look like this
    // {
    //   type: "refund",
    //   amount: Number,
    //   created: Number: Epoch Time,
    //   currency: String,
    //   raw: Object
    // }
    const emptyResult = [];
    return emptyResult;
  }
});

/**
 * @method normalizeRiskLevel
 * @private
 * @summary Normalizes the risk level response of a transaction to the values defined in paymentMethod schema
 * @param  {object} transaction - The transaction that we need to normalize
 * @return {string} normalized status string - either elevated, high, or normal
 */
function normalizeRiskLevel(transaction) {
  // the values to be checked against will depend on the return codes/values from the payment API
  if (transaction.riskStatus === "low_risk_level") {
    return "elevated";
  }

  if (transaction.riskStatus === "highest_risk_level") {
    return "high";
  }

  // default to normal if no other flagged
  return "normal";
}
