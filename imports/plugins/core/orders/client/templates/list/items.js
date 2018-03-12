import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Media } from "/lib/collections";

/**
 * ordersListItems helpers
 *
 */
Template.ordersListItems.helpers({
  media() {
    const cartImagesSub = Meteor.subscribe("CartItemImage", this);
    if (cartImagesSub.ready()) {
      const variantImage = Media.findOne({
        "metadata.productId": this.productId,
        "metadata.variantId": this.variants._id
      });
      // variant image
      if (variantImage) {
        return variantImage;
      }
      // find a default image
      const productImage = Media.findOne({
        "metadata.productId": this.productId
      });
      if (productImage) {
        return productImage;
      }
      return false;
    }
    return false;
  },

  items() {
    const { order } = Template.instance().data;
    const combinedItems = [];


    if (order) {
      // Lopp through all items in the order. The items are split into indivital items
      for (const orderItem of order.items) {
        // Find an exising item in the combinedItems array
        const foundItem = combinedItems.find((combinedItem) => {
          // If and item variant exists, then we return true
          if (combinedItem.variants) {
            return combinedItem.variants._id === orderItem.variants._id;
          }

          return false;
        });

        // Increment the quantity count for the duplicate product variants
        if (foundItem) {
          foundItem.quantity += 1;
        } else {
          // Otherwise push the unique item into the combinedItems array
          combinedItems.push(orderItem);
        }
      }

      return combinedItems;
    }

    return false;
  }
});
