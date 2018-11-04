import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import CatalogGrid from "@reactioncommerce/components/CatalogGrid/v1";
import { i18next } from "/client/api";

class ProductGrid extends Component {
  static propTypes = {
    canLoadMoreProducts: PropTypes.bool,
    currencyCode: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
    loadProducts: PropTypes.func,
    products: PropTypes.array,
    shopCurrencyCode: PropTypes.string
  }

  componentDidMount() {
    window.addEventListener("scroll", this.loadMoreProducts);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.loadMoreProducts);
  }

  // Load more products when user is close (80%) to the bottom
  loadMoreProducts = (event) => {
    const { canLoadMoreProducts, loadProducts } = this.props;
    const { documentElement } = document;
    const { scrollTop, scrollHeight, clientHeight } = documentElement;
    const scrollPercent = (scrollTop) / (scrollHeight - clientHeight) * 100;
    const isCloseToBottom = scrollPercent >= 80;
    if (canLoadMoreProducts && isCloseToBottom) {
      loadProducts(event);
    }
  }

  // render the loading spinner
  renderLoadingSpinner() {
    const { isLoading } = this.props;
    // if the products catalog is not ready
    // show the loading spinner
    if (isLoading) return <Components.Loading />;

    return null;
  }

  // render the No Products Found message
  renderNotFound() {
    const { products, isLoading } = this.props;
    // if the products subscription is ready & the products array is undefined or empty
    // show the Not Found message
    if (isLoading === false && (!Array.isArray(products) || !products.length)) {
      return (
        <Components.NotFound
          i18nKeyTitle="productGrid.noProductsFound"
          icon="fa fa-barcode"
          title="No Products Found"
        />
      );
    }

    return null;
  }

  // render the product grid
  renderProductGrid() {
    const { products, currencyCode, shopCurrencyCode } = this.props;
    const badgeLabels = {
      BACKORDER: i18next.t("productDetail.backOrder", "Backorder"),
      LOW_QUANTITY: i18next.t("productDetail.limitedSupply", "Limited Supply"),
      SOLD_OUT: i18next.t("productDetail.soldOut", "Sold Out!")
    };

    return (
      <div className="product-grid">
        <ul className="product-grid-list list-unstyled" id="product-grid-list">
          <CatalogGrid
            currencyCode={currencyCode || shopCurrencyCode}
            products={products}
            badgeLabels={badgeLabels}
          />
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div className="container-grid">
        {this.renderProductGrid()}
        {this.renderLoadingSpinner()}
        {this.renderNotFound()}
      </div>
    );
  }
}

export default ProductGrid;
