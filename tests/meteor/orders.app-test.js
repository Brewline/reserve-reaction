/* eslint prefer-arrow-callback:0 */
import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import ReactionError from "@reactioncommerce/reaction-error";
import Fixtures from "/imports/plugins/core/core/server/fixtures";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import { Orders, Notifications, Products, Shops } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/server";

Fixtures();

describe("orders test", function () {
  const shop = getShop();
  const shopId = shop._id;
  let methods;
  let sandbox;
  let order;
  let example;

  before(function (done) {
    methods = {
      "cancelOrder": Meteor.server.method_handlers["orders/cancelOrder"],
      "shipmentPicked": Meteor.server.method_handlers["orders/shipmentPicked"],
      "shipmentPacked": Meteor.server.method_handlers["orders/shipmentPacked"],
      "shipmentLabeled": Meteor.server.method_handlers["orders/shipmentLabeled"],
      "makeAdjustmentsToInvoice": Meteor.server.method_handlers["orders/makeAdjustmentsToInvoice"],
      "approvePayment": Meteor.server.method_handlers["orders/approvePayment"],
      "shipmentShipped": Meteor.server.method_handlers["orders/shipmentShipped"],
      "shipmentDelivered": Meteor.server.method_handlers["orders/shipmentDelivered"],
      "sendNotification": Meteor.server.method_handlers["orders/sendNotification"],
      "updateHistory": Meteor.server.method_handlers["orders/updateHistory"],
      "refunds/create": Meteor.server.method_handlers["orders/refunds/create"],
      "refunds/refundItems": Meteor.server.method_handlers["orders/refunds/refundItems"],
      "example/payment/capture": Meteor.server.method_handlers["example/payment/capture"]
    };

    example = Factory.create("examplePaymentPackage");
    return done();
  });

  beforeEach(function (done) {
    sandbox = sinon.sandbox.create();
    order = Factory.create("order");
    sandbox.stub(Reaction, "getShopId", () => order.shopId);
    const { payment } = shippingObjectMethod(order);
    sandbox.stub(payment, "paymentPluginName", example.name);
    return done();
  });

  afterEach(function (done) {
    Orders.remove({});
    sandbox.restore();
    return done();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `orders/${method}`, function (...args) {
      check(args, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return methods[method].apply(this, args);
    });
  }

  function shippingObjectMethod(orderObject) {
    const shippingObject = orderObject.shipping.find((shipping) => shipping.shopId === shopId);
    return shippingObject;
  }

  describe("orders/cancelOrder", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
    });

    it("should return an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const returnToStock = false;
      spyOnMethod("cancelOrder", order.userId);

      function cancelOrder() {
        return Meteor.call("orders/cancelOrder", order, returnToStock);
      }
      expect(cancelOrder).to.throw(ReactionError, /Access Denied/);
    });

    it("should increase inventory with number of items canceled when returnToStock option is selected", function () {
      const orderItemId = order.shipping[0].items[0].variantId;
      sandbox.stub(Reaction, "hasPermission", () => true); // Mock user permissions

      const { inventoryInStock } = Products.findOne({ _id: orderItemId }) || {};

      // approve the order (inventory decreases)
      spyOnMethod("approvePayment", order.userId);
      Meteor.call("orders/approvePayment", order);

      // Since we update Order info inside the `orders/approvePayment` Meteor call,
      // we need to re-find the order with the updated info
      const updatedOrder = Orders.findOne({ _id: order._id });

      // cancel order with returnToStock option (which should increment inventory)
      spyOnMethod("cancelOrder", updatedOrder.userId);
      Meteor.call("orders/cancelOrder", updatedOrder, true); // returnToStock = true;

      const product = Products.findOne({ _id: orderItemId });
      const inventoryAfterRestock = product.inventoryInStock;

      expect(inventoryInStock).to.equal(inventoryAfterRestock);
    });

    it("should NOT increase/decrease inventory when returnToStock option is false", function () {
      const orderItemId = order.shipping[0].items[0].variantId;
      sandbox.stub(Reaction, "hasPermission", () => true); // Mock user permissions

      // approve the order (inventory decreases)
      spyOnMethod("approvePayment", order.userId);
      Meteor.call("orders/approvePayment", order);

      const { inventoryInStock } = Products.findOne({ _id: orderItemId }) || {};

      // cancel order with NO returnToStock option (which should leave inventory untouched)
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, false); // returnToStock = false;

      const product = Products.findOne({ _id: orderItemId });
      const inventoryAfterNoRestock = product.inventoryInStock;

      expect(inventoryInStock).to.equal(inventoryAfterNoRestock);
    });

    it("should notify owner of the order, if the order is canceled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = true;
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const notify = Notifications.findOne({ to: order.userId, type: "orderCanceled" });
      expect(notify.message).to.equal("Your order was canceled.");
    });

    it("should update the payment method status and mode to refunded and canceled respectively ", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = false;
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const orderObject = Orders.findOne({ _id: order._id });
      expect(shippingObjectMethod(orderObject).payment.mode).to.equal("cancel");
    });

    it("should change the workflow status of the item to coreOrderItemWorkflow/canceled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const returnToStock = false;
      spyOnMethod("cancelOrder", order.userId);
      Meteor.call("orders/cancelOrder", order, returnToStock);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/canceled");
    });
  });

  describe("orders/shipmentPicked", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPicked", order, shipment);

      function shipmentPicked() {
        return Meteor.call("orders/shipmentPicked", order, shipment);
      }
      expect(shipmentPicked).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/picked", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPicked", order.userId);
      Meteor.call("orders/shipmentPicked", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/picked");
    });

    it("should update the shipment workflow status to coreOrderWorkflow/picked", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPicked", order.userId);
      Meteor.call("orders/shipmentPicked", order, shipment);
      const orderShipment = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipment.workflow.status).to.equal("coreOrderWorkflow/picked");
    });
  });

  describe("orders/shipmentPacked", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPacked", order, shipment);

      function shipmentPacked() {
        return Meteor.call("orders/shipmentPacked", order, shipment);
      }
      expect(shipmentPacked).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/packed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPacked", order.userId);
      Meteor.call("orders/shipmentPacked", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/packed");
    });

    it("should update the shipment workflow status to coreOrderWorkflow/packed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentPacked", order.userId);
      Meteor.call("orders/shipmentPacked", order, shipment);
      const orderShipment = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipment.workflow.status).to.equal("coreOrderWorkflow/packed");
    });
  });

  describe("orders/shipmentLabeled", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentLabeled", order, shipment);

      function shipmentLabeled() {
        return Meteor.call("orders/shipmentLabeled", order, shipment);
      }
      expect(shipmentLabeled).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/labeled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentLabeled", order.userId);
      Meteor.call("orders/shipmentLabeled", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/labeled");
    });

    it("should update the shipment workflow status to coreOrderWorkflow/labeled", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentLabeled", order.userId);
      Meteor.call("orders/shipmentLabeled", order, shipment);
      const orderShipment = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipment.workflow.status).to.equal("coreOrderWorkflow/labeled");
    });
  });

  describe("orders/makeAdjustmentsToInvoice", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("makeAdjustmentsToInvoice", order.userId);

      function makeAdjustmentsToInvoice() {
        return Meteor.call("orders/makeAdjustmentsToInvoice", order);
      }
      expect(makeAdjustmentsToInvoice).to.throw(ReactionError, /Access Denied/);
    });

    it("should make adjustment to the invoice", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("makeAdjustmentsToInvoice", order.userId);
      Meteor.call("orders/makeAdjustmentsToInvoice", order);
      const orderPaymentStatus = Orders.findOne({ _id: order._id }).payments[0].status;
      expect(orderPaymentStatus).equal("adjustments");
    });
  });

  describe("orders/approvePayment", function () {
    it("should throw an error if user is not admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("approvePayment", order.userId);
      function approvePayment() {
        return Meteor.call("orders/approvePayment", order._id, order.payments[0]._id);
      }
      expect(approvePayment).to.throw(ReactionError, /Access Denied/);
    });

    it("should approve payment", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("approvePayment", order.userId);
      const { invoice } = shippingObjectMethod(order);
      const subTotal = invoice.subtotal;
      const { shipping, taxes } = invoice;
      const discount = invoice.discounts;
      const discountTotal = Math.max(0, subTotal - discount); // ensure no discounting below 0.
      const total = accounting.toFixed(discountTotal + shipping + taxes, 2);
      Meteor.call("orders/approvePayment", order._id, order.payments[0]._id);
      const orderDoc = Orders.findOne({ _id: order._id });
      const orderBilling = shippingObjectMethod(orderDoc);
      expect(orderBilling.payment.status).to.equal("approved");
      expect(orderBilling.payment.mode).to.equal("capture");
      expect(orderBilling.payment.invoice.discounts).to.equal(discount);
      expect(orderBilling.payment.invoice.total).to.equal(Number(total));
    });
  });

  describe("orders/shipmentShipped", function () {
    it("should throw an error if user does not have permission", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const shipment = shippingObjectMethod(order);
      spyOnMethod("shipmentShipped", order.userId);
      function shipmentShipped() {
        return Meteor.call("orders/shipmentShipped", order, shipment);
      }
      expect(shipmentShipped).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.userId);
      Meteor.call("orders/shipmentShipped", order, shipment);
      const orderItem = Orders.findOne({ _id: order._id }).items[0];
      expect(orderItem.workflow.status).to.equal("coreOrderItemWorkflow/completed");
    });

    it("should update the order workflow status to completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.userId);
      Meteor.call("orders/shipmentShipped", order, shipment);
      const orderStatus = Orders.findOne({ _id: order._id }).workflow.status;
      expect(orderStatus).to.equal("coreOrderWorkflow/completed");
    });

    it("should update the order shipping workflow status to coreOrderWorkflow/shipped", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const shipment = shippingObjectMethod(order);
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
      spyOnMethod("shipmentShipped", order.userId);
      Meteor.call("orders/shipmentShipped", order, shipment);
      const orderShipped = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipped.workflow.status).to.equal("coreOrderWorkflow/shipped");
    });
  });

  describe("orders/shipmentDelivered", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
    });

    it("should throw an error if user does not have permissions", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("shipmentDelivered", order.userId);
      function shipmentDelivered() {
        return Meteor.call("orders/shipmentDelivered", order);
      }
      expect(shipmentDelivered).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order item workflow status to coreOrderItemWorkflow/completed", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.userId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderItemWorkflow = Orders.findOne({ _id: order._id }).items[0].workflow;
      expect(orderItemWorkflow.status).to.equal("coreOrderItemWorkflow/completed");
    });

    it("should update the order shipping workflow status to coreOrderWorkflow/delivered", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.userId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderShipping = shippingObjectMethod(Orders.findOne({ _id: order._id }));
      expect(orderShipping.workflow.status).to.equal("coreOrderWorkflow/delivered");
    });

    it("should update the order workflow status to processing", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("shipmentDelivered", order.userId);
      Meteor.call("orders/shipmentDelivered", order);
      const orderWorkflow = Orders.findOne({ _id: order._id }).workflow;
      expect(orderWorkflow.status).to.equal("coreOrderWorkflow/processing");
    });
  });

  describe("orders/sendNotification", function () {
    it("should return access denied if userId is not available", function () {
      spyOnMethod("sendNotification");
      function sendNotification() {
        return Meteor.call("orders/sendNotification", order._id);
      }
      expect(sendNotification).to.throw(ReactionError, /Access Denied/);
    });

    it("should send email notification", function () {
      spyOnMethod("sendNotification", order.userId);
      // stub url method for media file
      sandbox.stub(Media, "findOne", () => Promise.resolve({
        url: () => "/stub/url"
      }));
      sandbox.stub(Shops, "findOne", () => shop);
      const result = Meteor.call("orders/sendNotification", order._id);
      expect(result).to.be.true;
    });
  });

  describe("orders/updateHistory", function () {
    it("should return Access denied if user does not have permission", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      spyOnMethod("updateHistory", order.userId);
      function updateHistory() {
        const trackingValue = "65TFYTGFCHCUJVR66";
        return Meteor.call("orders/updateHistory", order._id, "Tracking added", trackingValue);
      }
      expect(updateHistory).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order history for the item", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      spyOnMethod("updateHistory", order.userId);
      const trackingValue = "65TFYTGFCHCUJVR66";
      const event = "Tracking added";
      Meteor.call("orders/updateHistory", order._id, event, trackingValue);
      const orders = Orders.findOne({ _id: order._id });
      expect(orders.history[0].event).to.equal(event);
      expect(orders.history[0].value).to.equal(trackingValue);
      expect(orders.history[0].userId).to.equal(order.userId);
    });
  });

  describe("orders/refunds/create", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
    });

    it("should return error if user is does not have admin permissions", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const group = shippingObjectMethod(order);
      spyOnMethod("refunds/create", order.userId);
      function refundsCreate() {
        const amount = 5.20;
        return Meteor.call("orders/refunds/create", order._id, group.payment, amount);
      }
      expect(refundsCreate).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order as refunded", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const group = shippingObjectMethod(order);
      spyOnMethod("refunds/create", order.userId);
      const amount = 5.20;
      Meteor.call("orders/refunds/create", order._id, group.payment, amount);
      const updateOrder = Orders.findOne({ _id: order._id });
      expect(shippingObjectMethod(updateOrder).payment.status).to.equal("refunded");
    });
  });

  describe("orders/refunds/refundItems", function () {
    beforeEach(function () {
      sandbox.stub(Meteor.server.method_handlers, "orders/sendNotification", function (...args) {
        check(args, [Match.Any]);
      });
    });

    it("should return error if user does not have admin permissions", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const group = shippingObjectMethod(order);
      spyOnMethod("refunds/refundItems", order.userId);
      function refundItems() {
        const refundItemsInfo = {
          total: 9.90,
          quantity: 2,
          items: [{}, {}]
        };
        return Meteor.call("orders/refunds/refundItems", order._id, group.payment._id, refundItemsInfo);
      }
      expect(refundItems).to.throw(ReactionError, /Access Denied/);
    });

    it("should update the order as partially refunded if not all of items in the order are refunded", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const group = shippingObjectMethod(order);
      spyOnMethod("refunds/refundItems", order.userId);
      const originalQuantity = order.totalItemQuantity;
      const quantity = originalQuantity - 1;
      const refundItemsInfo = {
        total: 3.99,
        quantity,
        items: [{}, {}]
      };
      Meteor.call("orders/refunds/refundItems", order._id, group.payment._id, refundItemsInfo);
      const updateOrder = Orders.findOne({ _id: order._id });
      expect(shippingObjectMethod(updateOrder).payment.status).to.equal("partialRefund");
    });

    it("should update the order as refunded if all items in the order are refunded", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const group = shippingObjectMethod(order);
      spyOnMethod("refunds/refundItems", order.userId);
      const originalQuantity = order.totalItemQuantity;
      const refundItemsInfo = {
        total: 9.90,
        quantity: originalQuantity,
        items: [{}, {}]
      };
      Meteor.call("orders/refunds/refundItems", order._id, group.payment._id, refundItemsInfo);
      const updateOrder = Orders.findOne({ _id: order._id });
      expect(shippingObjectMethod(updateOrder).payment.status).to.equal("refunded");
    });
  });
});
