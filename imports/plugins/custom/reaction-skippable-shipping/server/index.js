import { Meteor } from "meteor/meteor";

// customize RC stock server method. skip shipment for digital goods.
Meteor.startup(() => {
  const original =
    Meteor.default_server.method_handlers["workflow/pushCartWorkflow"];

  function customized(workflow, newWorkflowStatus, cartId) {
    check(workflow, String);
    check(newWorkflowStatus, String);
    check(cartId, Match.Optional(String));

    const inSkippableState = workflow === "coreCartWorkflow" &&
      newWorkflowStatus === "coreCheckoutShipping";

    if (inSkippableState) {
      // TODO: check that all products are digital

      // push cart workflow twice and essentially skip shipping step
      original.call(this, "coreCartWorkflow", "coreCheckoutShipping", cartId);

      let currentCart;
      if (typeof cartId === "string") {
        currentCart = Cart.findOne(cartId);
      } else {
        currentCart = Cart.findOne({
          userId: this.userId
        });
      }

      const shipmentMethod = Reaction.Collections.Shipping.findOne().methods[0];
      Meteor.call("cart/setShipmentMethod", currentCart._id, shipmentMethod);
      newWorkflowStatus = "checkoutReview";
    }

    return original.call(this, workflow, newWorkflowStatus, cartId);
  }

  Meteor.default_server.method_handlers["workflow/pushCartWorkflow"] =
    customized;
});
