import { Mongo } from "meteor/mongo";
import Schemas from "@reactioncommerce/schemas";
import "./schemas/watchlist-items";

/**
 * @name WatchlistItems
 * @memberof Collections
 * @type {MongoCollection}
 */
export const WatchlistItems = new Mongo.Collection("WatchlistItems");

WatchlistItems.attachSchema(Schemas.WatchlistItem);
