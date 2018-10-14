import { Mongo } from "meteor/mongo";
import Schemas from "@reactioncommerce/schemas";

/**
 * @name Sales
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Sales = new Mongo.Collection("Sales");

Sales.attachSchema(Schemas.Sales);
