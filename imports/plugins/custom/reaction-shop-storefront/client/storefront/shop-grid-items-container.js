// ******
// Ripped from containers/productGridItems.js
// s/product/shop
// ******

import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";
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

    // TODO: is this contructor necessary? I think not.
    constructor() {
      super();

      this.shopPath = this.shopPath.bind(this);
      this.positions = this.positions.bind(this);
      this.weightClass = this.weightClass.bind(this);
      this.shopMedia = this.shopMedia.bind(this);
      this.isMediumWeight = this.isMediumWeight.bind(this);
      this.onClick = this.onClick.bind(this);
    }

    shopPath = () => {
      if (this.props.shop) {
        let handle = this.props.shop.handle;

        if (this.props.shop.__published) {
          handle = this.props.shop.__published.handle;
        }

        return Reaction.Router.pathFor("shop", {
          hash: {
            handle
          }
        });
      }

      return "/";
    }

    positions = () => {
      // TODO: figure this out
      return {};
    }

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
        sort: { "uploadedAt": -1 } // sorted by most recent
      });

      return media && media[0];
    }

    isMediumWeight = () => {
      const positions = this.positions();
      const weight = positions.weight || 0;

      return weight === 1;
    }

    handleCheckboxSelect = (list, shop) => {
      let checkbox = list.querySelector(`input[type=checkbox][value="${shop._id}"]`);
      const items = document.querySelectorAll("li.shop-grid-item");
      const activeItems = document.querySelectorAll("li.shop-grid-item.active");
      const selected = activeItems.length;

      if (event.shiftKey && selected > 0) {
        const indexes = [
          Array.prototype.indexOf.call(items, document.querySelector(`li.shop-grid-item[id="${shop._id}"]`)),
          Array.prototype.indexOf.call(items, activeItems[0]),
          Array.prototype.indexOf.call(items, activeItems[selected - 1])
        ];
        for (let i = _.min(indexes); i <= _.max(indexes); i++) {
          checkbox = items[i].querySelector("input[type=checkbox]");
          if (checkbox.checked === false) {
            checkbox.checked = true;
            this.props.itemSelectHandler(checkbox.checked, shop._id);
          }
        }
      } else {
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          this.props.itemSelectHandler(checkbox.checked, shop._id);
        }
      }
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
  // SortableItem("shopGridItem"),
  wrapComponent
]);

export default compose(
  // SortableItem("shopGridItem"),
  wrapComponent
)(ShopGridItems);
