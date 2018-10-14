import { Mongo } from "meteor/mongo";
// be sure that ./schemas is loaded first
import Schemas from "@reactioncommerce/schemas";

/**
 * @name Sales
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Sales = new Mongo.Collection("Sales");

Sales.attachSchema(Schemas.Sale);
