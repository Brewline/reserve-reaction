// ******
// Ripped from containers/productGrid.js
// s/product/shop
// ******

import React, { Component } from "react";
import PropTypes from "prop-types";
// import update from "react/lib/update";
import { registerComponent } from "@reactioncommerce/reaction-components";
// import { Meteor } from "meteor/meteor";
// import { Session } from "meteor/session";
// import { Reaction } from "/client/api";
// import Logger from "/client/modules/logger";
// import { ReactionShop } from "/lib/api";
import ShopGrid from "./shop-grid-component";

const wrapComponent = (Comp) => (
  class ShopGridContainer extends Component {
    static propTypes = {
      shopIds: PropTypes.array,
      shops: PropTypes.array
    }

    constructor(props) {
      super(props);

      this.state = {
        shops: props.shops,
        shopIds: props.shopIds,
        initialLoad: true,
        canLoadMoreShops: false
      };
    }

    // componentWillMount() {
    //   const shops = this.shops;

    //   if (shops) {
    //     const filteredShops = _.filter(shops, (shop) => {
    //       return _.includes(selectedShops, shop._id);
    //     });

    //     if (Reaction.isPreview() === false) {
    //       Reaction.showActionView({
    //         label: "Grid Settings",
    //         i18nKeyLabel: "gridSettingsPanel.title",
    //         template: "shopSettings",
    //         type: "shop",
    //         data: { shops: filteredShops }
    //       });
    //     }
    //   }
    // }

    // componentWillReceiveProps = (nextProps) => {
    //   this.setState({
    //     shops: nextProps.shops,
    //     shopIds: nextProps.shopIds,
    //     shopsByKey: nextProps.shopsByKey
    //   });
    // }

    // handleSelectShopItem = (isChecked, shopId) => {
    //   let selectedShops = Session.get("shopGrid/selectedShops");

    //   if (isChecked) {
    //     selectedShops.push(shopId);
    //   } else {
    //     selectedShops = _.without(selectedShops, shopId);
    //   }

    //   Reaction.setUserPreferences("reaction-shop-variant", "selectedGridItems", selectedShops);

    //   // Save the selected items to the Session
    //   Session.set("shopGrid/selectedShops", _.uniq(selectedShops));

    //   const shops = this.shops;

    //   if (shops) {
    //     const filteredShops = _.filter(shops, (shop) => {
    //       return _.includes(selectedShops, shop._id);
    //     });

    //     Reaction.showActionView({
    //       label: "Grid Settings",
    //       i18nKeyLabel: "gridSettingsPanel.title",
    //       template: "shopSettings",
    //       type: "shop",
    //       data: { shops: filteredShops }
    //     });
    //   }
    // }

    // handleShopDrag = (dragIndex, hoverIndex) => {
    //   const newState = this.changeShopOrderOnState(dragIndex, hoverIndex);
    //   this.setState(newState, this.callUpdateMethod);
    // }

    // changeShopOrderOnState(dragIndex, hoverIndex) {
    //   const shop = this.state.shopIds[dragIndex];

    //   return update(this.state, {
    //     shopIds: {
    //       $splice: [
    //         [dragIndex, 1],
    //         [hoverIndex, 0, shop]
    //       ]
    //     }
    //   });
    // }

    // callUpdateMethod() {
    //   const tag = ReactionShop.getTag();

    //   this.state.shopIds.map((shopId, index) => {
    //     const position = { position: index, updatedAt: new Date() };

    //     Meteor.call("shops/updateShopPosition", shopId, position, tag, error => {
    //       if (error) {
    //         Logger.error(error);
    //         throw new Meteor.Error("error-occurred", error);
    //       }
    //     });
    //   });
    // }

    // get shops() {
    //   return this.state.shopIds.map((id) => this.state.shopsByKey[id]);
    // }

    render() {
      // <Components.DragDropProvider>
      // </Components.DragDropProvider>
      return (
        <Comp
          {...this.props}
        />
        // shops={this.shops}
        // onMove={this.handleShopDrag}
        // itemSelectHandler={this.handleSelectShopItem}
      );
    }
  }
);

registerComponent("ShopGrid", ShopGrid, wrapComponent);

export default wrapComponent(ShopGrid);
