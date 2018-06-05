import faker from "faker";
import _ from "lodash";
import Random from "@reactioncommerce/random";
import { Factory } from "meteor/dburles:factory";
import { Orders, Products } from "/lib/collections";
import { getShop } from "./shops";
import { getUser } from "./users";
import { getPkgData } from "./packages";
import { getAddress } from "./accounts";
import { addProduct } from "./products";

/**
 * @method randomProcessor
 * @memberof Fixtures
 * @summary Return a random payment processor string, either: `"Stripe"`, `"Paypal"` or `"Braintree"`
 * @return {String} Name of payment processor
 */
export function randomProcessor() {
  return _.sample(["Stripe", "Paypal", "Braintree"]);
}

const itemIdOne = Random.id();
const itemIdTwo = Random.id();

/**
 * @method randomStatus
 * @memberof Fixtures
 * @summary Return a random payment status, from: `"created", "approved", "failed", "canceled", "expired", "pending", "voided", "settled"`
 * @return {String} Payment status string
 */
export function randomStatus() {
  return _.sample([
    "created",
    "approved",
    "failed",
    "canceled",
    "expired",
    "pending",
    "voided",
    "settled"
  ]);
}

/**
 * @method randomMode
 * @memberof Fixtures
 * @summary Return a random credit card status, from: `"authorize", "capture", "refund", "void"`
 * @return {String} Payment status string
 */
export function randomMode() {
  return _.sample(["authorize", "capture", "refund", "void"]);
}

/**
 * @method paymentMethod
 * @memberof Fixtures
 * @summary Create Payment Method object
 * @return {Object}     Payment method object
 * @property {String} processor - `randomProcessor()`
 * @property {String} storedCard - `"4242424242424242"`
 * @property {String} transactionId - `Random.id()`
 * @property {String} status - `randomStatus()`
 * @property {String} mode - `randomMode()`
 * @property {String} authorization - `"auth field"`
 * @property {Number} amount - `faker.commerce.price()`
 */
export function paymentMethod(doc) {
  return {
    ...doc,
    processor: doc.processor ? doc.processor : randomProcessor(),
    storedCard: doc.storedCard ? doc.storedCard : "4242424242424242",
    transactionId: doc.transactionId ? doc.transactionId : Random.id(),
    status: doc.status ? doc.status : randomStatus(),
    mode: doc.mode ? doc.mode : randomMode(),
    authorization: "auth field",
    amount: doc.amount ? doc.amount : faker.commerce.price()
  };
}

/**
 * @method getUserId
 * @memberof Fixtures
 * @return {String} ID
 */
export function getUserId() {
  return getUser()._id;
}

/**
 * @method getShopId
 * @memberof Fixtures
 * @return {String} ID
 */
export function getShopId() {
  return getShop()._id;
}

export default function () {
  const shopId = getShopId();
  /**
   * @name order
   * @memberof Fixtures
   * @summary Create an Order Factory
   * @example order = Factory.create("order")
   * @property {String} additionalField OrderItems - `faker.lorem.sentence()`
   * @property {String} status OrderItems - `faker.lorem.sentence(3)`
   * @property {Array} history OrderItems History - `[]`
   * @property {Array} documents OrderItems Document - `[]`
   * @property {String} cartId Order - `Random.id()`
   * @property {Array} notes Order - `[]`
   * @property {String} shopId Cart - `shopId`
   * @property {String} shopId.userId Cart - `userId`
   * @property {String} shopId.sessionId Cart - `"Session"`
   * @property {String} shopId.email Cart - `faker.internet.email()`
   * @property {String} shopId.workflow Cart - Object
   * @property {String} shopId.workflow.status Cart - `"new"`
   * @property {String} shopId.workflow Cart - `"coreOrderWorkflow/created"`
   * @property {Array} shopId.items Array of products
   * @property {String} shopId.items._id Cart - Product - cart ID
   * @property {String} shopId.items.title Cart - Product - `"itemOne"`
   * @property {String} shopId.items.shopId Cart - Product - store ID
   * @property {String} shopId.items.productId Cart - Product - product ID
   * @property {Number} shopId.items.quantity Cart - Product - `1`
   * @property {Object} shopId.items.variants Cart - Product - variants
   * @property {Object} shopId.items.workflow Cart - Product - Object
   * @property {String} shopId.items.workflow.status Cart - Product - `"new"`
   * @property {Boolean} requiresShipping - `true`
   * @property {Array} shipping - Shipping - `[{}]`
   * @property {Object} items - Shipping - `Object`
   * @property {String} item._id - Shipping - `itemIdOne`
   * @property {String} item.productId - Shipping - `Random.id()`
   * @property {String} item.variantId - Shipping - `Random.id()`
   * @property {Boolean} item.packed - Shipping - `false`
   * @property {Array} billing - Billing - `[]`
   * @property {String} billing._id - Billing - `Random.id()`
   * @property {Object} billing.address - Billing - Address object
   * @property {Object} billing.paymentMethod - Billing - Payment Method
   * @property {String} billing.paymentMethod.method - `"credit"`
   * @property {String} billing.paymentMethod.processor - `"Example"`
   * @property {String} billing.paymentMethod.storedCard - `"Mastercard 2346"`
   * @property {String} billing.paymentMethod.paymentPackageId - `getPkgData("example-paymentmethod")._id`
   * @property {String} paymentSettingsKey - `"example-paymentmethod"`
   * @property {String} mode - `"authorize"`
   * @property {String} status - `"created"`
   * @property {Number} amount - `12.4`
   * @property {Object} invoice - Object
   * @property {Number} invoice.total - `12.45`
   * @property {Number} invoice.subtotal - `12.45`
   * @property {Number} invoice.discounts - `0`
   * @property {Number} invoice.taxes - `0.12`
   * @property {Number} invoice.shipping - `4.0`
   * @property {String} state - `"new"`
   * @property {Date} createdAt - `new Date()`
   * @property {Date} updatedAt - `new Date()`
   */
  Factory.define("order", Orders, {
    // Schemas.OrderItems
    additionalField: faker.lorem.sentence(),
    status: faker.lorem.sentence(3),
    history: [],
    documents: [],

    // Schemas.Order
    cartId: Random.id(),
    notes: [],

    // Schemas.Cart
    shopId,
    userId: getUserId(),
    sessionId: "Session",
    email: faker.internet.email(),
    workflow: {
      status: "new",
      workflow: [
        "coreOrderWorkflow/created"
      ]
    },
    items() {
      const product = addProduct({ shopId });
      const variant = Products.findOne({ ancestors: [product._id] });
      const childVariants = Products.find({
        ancestors: [
          product._id, variant._id
        ]
      }).fetch();
      const selectedOption = Random.choice(childVariants);
      const product2 = addProduct({ shopId });
      const variant2 = Products.findOne({ ancestors: [product2._id] });
      const childVariants2 = Products.find({
        ancestors: [
          product2._id, variant2._id
        ]
      }).fetch();
      const selectedOption2 = Random.choice(childVariants2);
      return [{
        _id: itemIdOne,
        title: "firstItem",
        shopId: product.shopId,
        productId: product._id,
        quantity: 1,
        product,
        variants: selectedOption,
        workflow: {
          status: "new"
        }
      }, {
        _id: itemIdTwo,
        title: "secondItem",
        shopId: product2.shopId,
        productId: product2._id,
        quantity: 1,
        product: product2,
        variants: selectedOption2,
        workflow: {
          status: "new"
        }
      }];
    },
    requiresShipping: true,
    shipping: [{
      shopId,
      address: getAddress({ isShippingDefault: true }),
      items: [
        {
          _id: itemIdOne,
          productId: Random.id(),
          quantity: 1,
          shopId,
          variantId: Random.id(),
          packed: false
        },
        {
          _id: itemIdTwo,
          productId: Random.id(),
          quantity: 1,
          shopId,
          variantId: Random.id(),
          packed: false
        }
      ]
    }], // Shipping Schema
    billing: [{
      _id: Random.id(),
      shopId,
      address: getAddress({ isBillingDefault: true }),
      paymentMethod: paymentMethod({
        method: "credit",
        processor: "Example",
        storedCard: "Mastercard 2346",
        paymentPackageId: getPkgData("example-paymentmethod") ? getPkgData("example-paymentmethod")._id : "uiwneiwknekwewe",
        paymentSettingsKey: "example-paymentmethod",
        mode: "authorize",
        status: "created",
        amount: 12.45
      }),
      invoice: {
        total: 12.45,
        subtotal: 12.45,
        discounts: 0,
        taxes: 0.12,
        shipping: 4.00
      }
    }],
    state: "new",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  /**
   * @name authorizedApprovedPaypalOrder
   * @summary Defines order factory which generates an authorized, approved, paypal order.
   * @memberof Fixtures
   * @property {Array} billing - Array of Billing objects
   * @property {String} billing._id
   * @property {String} billing.shopId
   * @property {Object} billing.address - Address object
   * @property {Object} billing.paymentMethod
   * @property {String} billing.paymentMethod.processor "Paypal"
   * @property {String} billing.paymentMethod.mode "authorize"
   * @property {String} billing.paymentMethod.status "approved
   */
  Factory.define(
    "authorizedApprovedPaypalOrder", Orders,
    Factory.extend("order", {
      billing: [{
        _id: Random.id(),
        shopId: getShopId(),
        address: getAddress({ isBillingDefault: true }),
        paymentMethod: paymentMethod({
          processor: "Paypal",
          mode: "authorize",
          status: "approved"
        })
      }]
    })
  );
}
