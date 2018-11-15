import ReactGA from "react-ga";
import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { StyleRoot } from "radium";
import { compose } from "recompose";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction, Router } from "/client/api";
// import { Media } from "/imports/plugins/core/files/client";

import SaleDetail from "./sale-detail-component";
import ReactionSale from "./reaction-sale";

function showActionView(actionView) {
  if (!Reaction.isActionViewOpen()) {
    Reaction.showActionView();
  }

  Reaction.state.set("edit/focus", "saleDashboard");
  Reaction.setActionView(actionView);

  const { label } = actionView;

  ReactGA.event({
    category: "Sales",
    action: `Open ${label}`
  });
}

const wrapComponent = (Comp) => (
  class SaleDetailContainer extends Component {
    static propTypes = {
      media: PropTypes.arrayOf(PropTypes.object),
      sale: PropTypes.object
    };

    handleViewContextChange = (event, value) => {
      Reaction.Router.setQueryParams({ as: value });
    }

    handleDeleteSale = () => {
      ReactionSale.archiveSale(this.props.sale);
    }

    handleAddProduct = () => {
      showActionView({
        i18nKeyLabel: "saleDetailEdit.saleDashboard",
        label: "Sale Dashboard",
        template: "SaleAddProduct"
      });
    }

    handleEdit = () => {
      showActionView({
        i18nKeyLabel: "saleDetailEdit.saleDashboard",
        label: "Sale Dashboard",
        template: "SaleDashboard"
      });
    }

    render() {
      const { media, sale } = this.props;

      if (_.isEmpty(sale)) {
        return <Components.SaleNotFound />;
      }

      return (
        <StyleRoot>
          <Comp
            mediaGalleryComponent={<Components.MediaGallery media={media} />}
            onViewContextChange={this.handleViewContextChange}
            socialComponent={<Components.SocialContainer />}
            topVariantComponent={<Components.VariantListContainer />}
            onAddProduct={this.handleAddProduct}
            onEdit={this.handleEdit}
            {...this.props}
          />
        </StyleRoot>
      );
    }
  }
);

function composer(props, onData) {
  let products;
  const mediaArray = [];
  const saleIdOrSlug = Reaction.Router.getParam("idOrSlug");
  // TODO: replace with Reaction.isPreview
  const viewSaleAs = Reaction.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

  if (!saleIdOrSlug) {
    Router.go("sales");
  }

  const productsSubscription =
    Meteor.subscribe("AllSaleProducts", saleIdOrSlug, !Reaction.isPreview());
  // Meteor.subscribe("SaleProducts", saleIdOrSlug);

  if (!Reaction.Subscriptions.Sales.ready()) { return; }

  const sale = ReactionSale.setSale(saleIdOrSlug);

  if (Reaction.hasPermission("createProduct")) { // TODO: createSale
    if (!Reaction.getActionView() && Reaction.isActionViewOpen() === true) {
      Reaction.setActionView({
        template: "saleAdmin",
        data: sale
      });
    }
  }

  // Get the sale tags
  if (sale) {
    // Meteor.subscribe("SaleMedia", sale._id);

    // const selectedVariant = ReactionProduct.selectedVariant();

    // if (selectedVariant) {
    //   // Find the media for the selected variant
    //   mediaArray = Media.findLocal(
    //     {
    //       "metadata.variantId": selectedVariant._id
    //     },
    //     {
    //       sort: {
    //         "metadata.priority": 1
    //       }
    //     }
    //   );

    //   // If no media found, broaden the search to include other media from parents
    //   if (Array.isArray(mediaArray) && mediaArray.length === 0 && selectedVariant.ancestors) {
    //     // Loop through ancestors in reverse to find a variant that has media to use
    //     for (const ancestor of selectedVariant.ancestors.reverse()) {
    //       const media = Media.findLocal(
    //         {
    //           "metadata.variantId": ancestor
    //         },
    //         {
    //           sort: {
    //             "metadata.priority": 1
    //           }
    //         }
    //       );

    //       // If we found some media, then stop here
    //       if (Array.isArray(media) && media.length) {
    //         mediaArray = media;
    //         break;
    //       }
    //     }
    //   }
    // }

    if (productsSubscription.ready()) {
      products = ReactionSale.getProducts() || [];

      Meteor.subscribe("ProductGridMedia", products.map((p) => p._id));
    }
  }

  // we may want to wait for the Media subscription to come back
  onData(null, {
    products,
    isProductsSubscriptionReady: productsSubscription.ready(),
    isReady: productsSubscription.ready(),
    sale,
    media: mediaArray,
    viewAs: viewSaleAs,
    hasAdminPermission: Reaction.hasPermission(["createProduct"]) // TODO: createSale
  });
}

registerComponent("SaleDetail", SaleDetail, [composeWithTracker(composer), wrapComponent]);

// Decorate component and export
export default compose(composeWithTracker(composer), wrapComponent)(SaleDetail);
