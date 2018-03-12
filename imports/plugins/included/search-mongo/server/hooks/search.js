import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Products, ProductSearch, Orders, OrderSearch, AccountSearch } from "/lib/collections";
import {
  getSearchParameters,
  buildAccountSearchRecord,
  buildOrderSearchRecord,
  buildProductSearchRecord
} from "../methods/searchcollections";
import { Hooks, Logger } from "/server/api";

Hooks.Events.add("afterAccountsInsert", (userId, accountId) => {
  if (AccountSearch && !Meteor.isAppTest) {
    buildAccountSearchRecord(accountId);
  }
});

Hooks.Events.add("afterAccountsRemove", (userId, accountId) => {
  if (AccountSearch && !Meteor.isAppTest) {
    AccountSearch.remove(accountId);
  }
});

Hooks.Events.add("afterAccountsUpdate", (userId, accountId) => {
  if (AccountSearch && !Meteor.isAppTest) {
    AccountSearch.remove(accountId);
    buildAccountSearchRecord(accountId);
  }
});


Orders.after.remove((userId, doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    OrderSearch.remove(doc._id);
  }
});

Orders.after.insert((userId, doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = doc._id;
    buildOrderSearchRecord(orderId);
  }
});

Orders.after.update((userId, doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = doc._id;
    OrderSearch.remove(orderId);
    buildOrderSearchRecord(orderId);
  }
});

/**
 * if product is removed, remove product search record
 */
Products.after.remove((userId, doc) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    ProductSearch.remove(productId);
    Logger.debug(`Removed product ${productId} from ProductSearch collection`);
  }
});

//
// after product update rebuild product search record
//
Products.after.update((userId, doc, fieldNames) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    const { fieldSet } = getSearchParameters();
    const modifiedFields = _.intersection(fieldSet, fieldNames);
    if (modifiedFields.length) {
      Logger.debug(`Rewriting search record for ${doc.title}`);
      ProductSearch.remove(productId);
      if (!doc.isDeleted) { // do not create record if product was archived
        buildProductSearchRecord(productId);
      }
    } else {
      Logger.debug("No watched fields modified, skipping");
    }
  }
});

/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 */
Products.after.insert((userId, doc) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    buildProductSearchRecord(productId);
    Logger.debug(`Added product ${productId} to ProductSearch`);
  }
});
