import { DocHead } from "meteor/kadira:dochead";
import { ReactionProduct, getShopId } from "/lib/api";
import { Shops, SellerShops } from "/lib/collections";

/**
 * MetaData
 * populates title and meta tags for routes
 * init accepts Router.current() context
 */
export const MetaData = {
  init(context) {
    const params = context.params;
    const product = ReactionProduct.selectedProduct();
    const shop = Shops.findOne(getShopId());
    const meta = [];
    let title = "";
    const keywords = [];

    // case helper
    const titleCase = (param) => {
      return param.charAt(0).toUpperCase() + param.substring(1);
    };

    // populate meta from shop
    if (shop) {
      // shop defaults
      if (shop && shop.description) {
        DocHead.addMeta({
          name: "description",
          content: shop.description.substring(0, 160)
        });
      }

      if (shop && shop.keywords) {
        DocHead.addMeta({
          name: "keywords",
          content: shop.keywords.toString()
        });
      }

      // set title defaults
      MetaData.name = shop.name;

      // product title default
      if (params && params.handle) {
        if (product && product.title) {
          title = titleCase(product.title);
        } else {
          title = titleCase(params.handle);
        }

      // tag slugs
      } else if (params && params.slug) {
        title = titleCase(params.slug);

      // fallback to route name
      } else if (context.route && context.route.name) {
        const route = context.route;
        const routeName = route.name;

        // default index to Shop Name
        if (routeName === "index") {
          title = titleCase(shop.name);

        // seller shop homepage
        } else if (routeName === "shop") {
          const currentShop = SellerShops.findOne(params.shopId);
          if (currentShop) {
            title = titleCase(currentShop.name);
          } else {
            title = titleCase(routeName);
          }
        // check for meta in package route
        } else if (route.options.meta && route.options.meta.title) {
          title = titleCase(route.options.meta.title);
        } else {
          // default routes to route's name
          title = titleCase(routeName);
        }
      }

      //  product details
      if (params && params.handle && product) {
        // discard defaults
        DocHead.removeDocHeadAddedTags();

        if (product.description) {
          DocHead.addMeta({
            name: "description",
            content: product.description.substring(0, 160)
          });
        }

        if (product && product.metafields) {
          for (const key of product.metafields) {
            keywords.push(key.value);
          }
        }

        if (keywords) {
          DocHead.addMeta({
            name: "keywords",
            content: keywords.toString()
          });
        }
      }

      // set site defaults
      DocHead.setTitle(title);
      MetaData.title = title;
      MetaData.meta = meta;
      return meta;
    } // end shop
  } // end update
};
