import _ from "lodash";
import { Template } from "meteor/templating";
import { Media } from "/lib/collections";

/**
 * cartDrawerItems helpers
 *
 * @provides media
 * @returns default product image
 */
Template.cartDrawerItems.helpers({
  product() {
    return this;
  },
  media() {
    const product = this;
    let defaultImage = Media.findOne({
      "metadata.variantId": this.variants._id
    });

    if (defaultImage) {
      return defaultImage;
    } else if (product) {
      _.some(product.variants, (variant) => {
        if (variant) {
          defaultImage = Media.findOne({
            "metadata.variantId": variant._id
          });
          return !!defaultImage;
        }
      });
    }
    return defaultImage;
  }
});
