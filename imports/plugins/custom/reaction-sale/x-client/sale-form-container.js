import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import ReactGA from "react-ga";
import { Reaction, Router } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";

import ReactionSale from "./reaction-sale";
import SaleForm from "./sale-form-component";

const handlers = {
  onSave(saleData) {
    const { _id: saleId, headline, slug } = saleData;

    Meteor.call("Sales/save", saleData, (err, res) => {
      if (err) {
        // TODO: correct wording
        // return Alerts.toast(err.reason, "error");
        return Alerts.toast("Oops... something went wrong. try again later, maybe?", "error");
      }

      Reaction.hideActionView();

      if (!saleId) { // i.e., an update
        Router.go("sale", { idOrSlug: slug || res });
      }

      ReactGA.event({
        category: "Can Releases",
        action: saleId ? "Update Can Release" : "Create Can Release",
        label: headline
      });
    });
  }
};

function composer(props, onData) {
  const sale = ReactionSale.selectedSale();
  let media;

  if (sale) {
    // const selectedVariant = ReactionProduct.selectedVariant();

    // if (selectedVariant) {
    //   media = getPrimaryMediaForItem({
    //     productId: product._id,
    //     variantId: selectedVariant._id
    //   });
    // }

    // const templates = Templates.find({
    //   parser: "react",
    //   provides: "template",
    //   templateFor: { $in: ["pdp"] },
    //   enabled: true
    // }).map((template) => ({
    //   label: template.title,
    //   value: template.name
    // }));
  }

  onData(null, {
    editFocus: Reaction.state.get("edit/focus") || "saleDetails",
    sale,
    media
    // templates
  });
}

registerComponent("SaleForm", SaleForm, [
  composeWithTracker(composer),
  withProps(handlers)
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers)
)(SaleForm);
