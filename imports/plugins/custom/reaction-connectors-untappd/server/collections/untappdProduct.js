import SimpleSchema from "simpl-schema";
import { Products } from "/lib/collections";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @file UntappdProduct
 *
 * @module reaction-connectors-untappd
 */

/**
 * @name UntappdProduct
 * @summary UntappdProduct schema attached to Products type "simple" and "variant"
 * @type {SimpleSchema}
 * @property {Number} UntappdId Untappd ID
 */
export const UntappdProduct = new SimpleSchema({
  UntappdId: {
    type: SimpleSchema.Integer,
    optional: true
  },
  UntappdResource: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

registerSchema("UntappdProduct", UntappdProduct);

Products.attachSchema(UntappdProduct, { selector: { type: "simple" } });
Products.attachSchema(UntappdProduct, { selector: { type: "variant" } });

Meteor.publish("UntappdProducts", function (sort = {}) {
  // Active shop
  const shopId = Reaction.getShopId();

  // Get a list of shopIds that this user has "createProduct" permissions for (owner permission is checked by default)
  const userAdminShopIds = Reaction.getShopsWithRoles(["createProduct"], this.userId);

  // Don't publish if we're missing an active or primary shopId
  if (!shopId) {
    return this.ready();
  }

  // Get active shop id's to use for filtering
  const activeShopsIds = Shops.find({
    $or: [
      { "workflow.status": "active" },
      { _id: Reaction.getPrimaryShopId() }
    ]
  }).fetch().map((activeShop) => activeShop._id);

  // Init default selector - Everyone can see products that fit this selector
  const selector = {
    ancestors: [], // Lookup top-level products
    isDeleted: { $in: [null, false] }, // by default, we don't publish deleted products
    isVisible: true, // by default, only lookup visible products
    UntappdId: { $nin: [null, false, ""] }
  };

  // We publish an admin version of this publication to admins of products who are in "Edit Mode"
  // Authorized content curators for shops get special publication of the product
  // with all relevant revisions all is one package
  // userAdminShopIds is a list of shopIds that the user has createProduct or owner access for
  if (userAdminShopIds && Array.isArray(userAdminShopIds) && userAdminShopIds.length > 0) {
    selector.isVisible = {
      $in: [true, false, null, undefined]
    };
    selector.shopId = {
      $in: activeShopsIds
    };

    // Get _ids of top-level products
    const productIds = Products.find(selector, {
      sort
    }).map((product) => product._id);

    let newSelector = selector;

    // Remove hashtag filter from selector (hashtags are not applied to variants, we need to get variants)
    newSelector = _.omit(selector, ["hashtags", "ancestors"]);
    _.extend(newSelector, {
      $or: [{
        ancestors: {
          $in: productIds
        }
      }, {
        _id: {
          $in: productIds
        }
      }]
    });

    if (RevisionApi.isRevisionControlEnabled()) {
      const productCursor = Products.find(newSelector);
      const handle = productCursor.observeChanges({
        added: (id, fields) => {
          const revisions = Revisions.find({
            "$or": [
              { documentId: id },
              { parentDocument: id }
            ],
            "workflow.status": {
              $nin: [
                "revision/published"
              ]
            }
          }).fetch();
          fields.__revisions = revisions;

          this.added("Products", id, fields);
        },
        changed: (id, fields) => {
          const revisions = Revisions.find({
            "$or": [
              { documentId: id },
              { parentDocument: id }
            ],
            "workflow.status": {
              $nin: [
                "revision/published"
              ]
            }
          }).fetch();

          fields.__revisions = revisions;
          this.changed("Products", id, fields);
        },
        removed: (id) => {
          this.removed("Products", id);
        }
      });

      const handle2 = Revisions.find({
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        }
      }).observe({
        added: (revision) => {
          let product;
          if (!revision.documentType || revision.documentType === "product") {
            product = Products.findOne(revision.documentId);
          } else if (revision.documentType === "image" || revision.documentType === "tag") {
            product = Products.findOne(revision.parentDocument);
          }

          if (product) {
            this.added("Products", product._id, product);
            this.added("Revisions", revision._id, revision);
          }
        },
        changed: (revision) => {
          let product;
          if (!revision.documentType || revision.documentType === "product") {
            product = Products.findOne(revision.documentId);
          } else if (revision.documentType === "image" || revision.documentType === "tag") {
            product = Products.findOne(revision.parentDocument);
          }
          if (product) {
            product.__revisions = [revision];
            this.changed("Products", product._id, product);
            this.changed("Revisions", revision._id, revision);
          }
        },
        removed: (revision) => {
          let product;

          if (!revision.documentType || revision.documentType === "product") {
            product = Products.findOne(revision.documentId);
          } else if (revision.docuentType === "image" || revision.documentType === "tag") {
            product = Products.findOne(revision.parentDocument);
          }
          if (product) {
            product.__revisions = [];
            this.changed("Products", product._id, product);
            this.removed("Revisions", revision._id, revision);
          }
        }
      });


      this.onStop(() => {
        handle.stop();
        handle2.stop();
      });

      const mediaProductIds = productCursor.fetch().map((p) => p._id);
      const mediaCursor = findProductMedia(this, mediaProductIds);

      return [
        mediaCursor
      ];
    }
    // Revision control is disabled, but is admin
    const productCursor = Products.find(newSelector, {
      sort
    });
    const mediaProductIds = productCursor.fetch().map((p) => p._id);
    const mediaCursor = findProductMedia(this, mediaProductIds);

    return [
      productCursor,
      mediaCursor
    ];
  }

  // This is where the publication begins for non-admin users
  // Get _ids of top-level products
  const productIds = Products.find(selector, {
    sort
  }).map((product) => product._id);

  let newSelector = { ...selector };

  // Remove hashtag filter from selector (hashtags are not applied to variants, we need to get variants)
  newSelector = _.omit(selector, ["hashtags", "ancestors"]);

  _.extend(newSelector, {
    $or: [{
      ancestors: {
        $in: productIds
      }
    }, {
      _id: {
        $in: productIds
      }
    }]
  });

  // Adjust the selector to include only active shops
  newSelector = {
    ...newSelector,
    shopId: {
      $in: activeShopsIds
    }
  };

  // Returning Complete product tree for top level products to avoid sold out warning.
  const productCursor = Products.find(newSelector);

  const mediaProductIds = productCursor.fetch().map((p) => p._id);
  const mediaCursor = findProductMedia(this, mediaProductIds);

  return [
    productCursor,
    mediaCursor
  ];
});
