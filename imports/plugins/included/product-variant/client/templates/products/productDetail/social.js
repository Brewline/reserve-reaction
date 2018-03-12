import { ReactionProduct } from "/lib/api";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

/**
* productSocial helpers
*/

Template.productSocial.helpers({
  customSocialSettings() {
    const product = ReactionProduct.selectedProduct();
    let { title } = product;
    if (ReactionProduct.selectedVariant()) {
      ({ title } = ReactionProduct.selectedVariant());
    }

    const settings = {
      placement: "productDetail",
      faClass: "",
      faSize: "fa-lg",
      media: Session.get("variantImgSrc"),
      url: window.location.href,
      title: title || "",
      description: typeof product.description === "string" ? product.description.substring(0, 254) : undefined,
      apps: {
        facebook: {
          description: product.facebookMsg
        },
        twitter: {
          title: product.twitterMsg
        },
        googleplus: {
          itemtype: "Product",
          description: product.googleplusMsg
        },
        pinterest: {
          description: product.pinterestMsg
        }
      }
    };
    return settings;
  }
});
