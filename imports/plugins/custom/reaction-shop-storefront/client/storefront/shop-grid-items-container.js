// ******
// Ripped from containers/productGridItems.js
// s/product/shop
// ******

import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import ShopGridItems from "./shop-grid-items-component";

const wrapComponent = (Comp) => (
  class ShopGridItemsContainer extends Component {
    static propTypes = {
      // connectDragSource: PropTypes.func,
      // connectDropTarget: PropTypes.func,
      itemSelectHandler: PropTypes.func,
      shop: PropTypes.object,
      unmountMe: PropTypes.func
    }

    shopPath = () => {
      if (this.props.shop) {
        let { handle } = this.props.shop;

        if (this.props.shop.__published) {
          ({ handle } = this.props.shop.__published);
        }

        return Reaction.Router.pathFor("shop", {
          hash: {
            handle
          }
        });
      }

      return "/";
    }

    positions = () =>
      // TODO: figure this out
      ({})


    weightClass = () => {
      const { weight } = this.positions();

      switch (weight) {
        case 0:
          return "product-small";
        case 2:
          return "product-large";
        default:
          return "product-medium";
      }
    }

    shopMedia = () => {
      const { shop } = this.props;

      if (shop && _.isArray(shop.brandAssets)) {
        const [asset] = shop.brandAssets;

        if (asset) {
          const brandAssets = Media.findLocal({ _id: asset.mediaId });
          const brandAsset = brandAssets && brandAssets[0];

          if (brandAsset) {
            return brandAsset;
          }
        }
      }

      const media = Media.findLocal({
        "metadata.shopId": this.props.shop._id /* ,
        "metadata.type": "brandAsset" */
      }, {
        sort: { uploadedAt: -1 } // sorted by most recent
      });

      return media && media[0];
    }

    isMediumWeight = () => {
      const positions = this.positions();
      const weight = positions.weight || 0;

      return weight === 1;
    }

    onClick = (event) => {
      event.preventDefault();

      const { shop } = this.props;

      Reaction.setShopId(shop._id);
    }

    render() {
      return (
        <Comp
          shop={this.props.shop}
          shopPath={this.shopPath}
          positions={this.positions}
          weightClass={this.weightClass}
          media={this.shopMedia}
          isMediumWeight={this.isMediumWeight}
          onClick={this.onClick}
          {...this.props}
        />
      );
    }
  }
);

registerComponent("ShopGridItems", ShopGridItems, [
  wrapComponent
]);

export default compose(wrapComponent)(ShopGridItems);
