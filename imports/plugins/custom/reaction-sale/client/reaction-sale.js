import _ from "lodash";
import { ReactiveDict } from "meteor/reactive-dict";
import { Router } from "/imports/plugins/core/router/lib";
import { Products } from "/lib/collections";
import { Sales } from "../lib/collections";
import { MetaData } from "/lib/api/router/metadata";

/**
 * @file ReactionSale is only intended to be used on the client, but it's placed
 * in common code because it is imported by the Sales schema.
 * ReactionSale is a
 * {@link https://github.com/meteor/meteor/blob/master/packages/reactive-dict/README.md| ReactiveDict},
 * a general-purpose reactive datatype to use with
 * {@link https://github.com/meteor/meteor/tree/master/packages/tracker|Meteor Tracker}.
 * ReactionSale allows the current sale to be reactive, without Session.
 * @namespace ReactionSale
 */

/**
 * @name ReactionSale
 * @method
 * @memberof ReactionSale
 * @summary Reactive current sale dependency, ensuring reactive sales, without session
 * ReactionSale is a `ReactiveDict`, a general-purpose reactive datatype to use with Meteor Tracker.
 * @see {@link https://github.com/meteor/meteor/blob/master/packages/reactive-dict/README.md|Meteor ReactiveDict}
 * @see {@link https://github.com/meteor/meteor/tree/master/packages/tracker|Meteor Tracker}
 * @todo this is a messy class implementation, normalize it.
 */
const ReactionSale = new ReactiveDict("currentSale");

/**
 * @name setSale
 * @todo this will be deprecated in favor of template.instance data.
 * @method
 * @memberof ReactionSale
 * @summary method to set default/parameterized sale variant
 * @param {String} saleIdOrSlug - set current saleId
 * @return {Object} sale object
 */
ReactionSale.setSale = (saleIdOrSlug) => {
  let saleId = saleIdOrSlug || Router.getParam("slug");

  // Find the current sale
  const sale = Sales.findOne({
    $or: [
      { _id: saleId },
      { slug: saleId },
      { slug: saleId.toLowerCase() },
      { changedSlugWas: saleId.toLowerCase() }
    ]
  });

  saleId = sale && sale._id;

  if (sale) {
    if (
      Router.getParam("slug") !== sale.slug &&
      sale.changedHandleWas &&
      sale.changedHandleWas !== sale.slug
    ) {
      const newUrl = Router.pathFor("sale", {
        hash: {
          slug: sale.slug
        }
      });
      Router.go(newUrl);
    }

    // set in our reactive dictionary
    ReactionSale.set("saleId", saleId);
  }

  // Update the meta data when a sale is selected
  MetaData.init(Router.current());

  return sale;
};

/**
 * @name selectedSaleId
 * @method
 * @memberof ReactionSale
 * @summary get the currently active/requested sale
 * @return {String} currently selected sale id
 */
ReactionSale.selectedSaleId = () => ReactionSale.get("saleId");

/**
 * @name selectedSale
 * @method
 * @memberof ReactionSale
 * @summary get the currently active/requested sale object
 * @return {Object|undefined} currently selected sale cursor
 */
ReactionSale.selectedSale = function () {
  const id = ReactionSale.selectedSaleId();
  if (typeof id === "string") {
    return Sales.findOne(id);
  }
  return undefined;
};

ReactionSale.getProducts = function () {
  const saleVariants = Products.find(
    { saleId: ReactionSale.selectedSaleId() },
    { saleId: { $ne: null } }, // just in case selectedSaleId is null
    { fields: { ancestors: 1 } }
  ).fetch();

  const saleProductIds = _.chain(saleVariants)
    .map((v) => v.ancestors)
    .flatten()
    .value();

  return Products.find({
    _id: { $in: saleProductIds },
    type: "simple"
  }).fetch();
};

export default ReactionSale;
