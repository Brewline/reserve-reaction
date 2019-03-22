import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class GridItemNotice extends Component {
  static propTypes = {
    isBackorder: PropTypes.func,
    isLowQuantity: PropTypes.func,
    isSoldOut: PropTypes.func
  }

  render() {
    if (this.props.isSoldOut()) {
      if (this.props.isBackorder()) {
        return (
          <Components.Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        );
      }
      return (
        <Components.Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
      );
    } else if (this.props.isLowQuantity()) {
      return (
        <Components.Translation defaultValue="Limited Supply" i18nKey="productDetail.limitedSupply" />
      );
    }

    return (
      <Components.Translation defaultValue="In Stock" i18nKey="productDetail.inStock" />
    );
  }
}

export default GridItemNotice;
