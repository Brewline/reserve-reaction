import { Mongo } from "meteor/mongo";
import Schemas from "@reactioncommerce/schemas";
import "./schemas/watchlist-items";

/**
 * @name WatchlistItems
 * @memberof Collections
 * @type {MongoCollection}
 */
export const WatchlistItemsCollection = new Mongo.Collection("WatchlistItems");

WatchlistItemsCollection.attachSchema(Schemas.WatchlistItem);

export const WatchlistItems = WatchlistItemsCollection.rawCollection();
