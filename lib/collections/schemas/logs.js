import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Logs
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} logType required
 * @property {String} shopId required
 * @property {String} level default: `"info"`, allowed: `"trace"`, `"debug"`, `"info"`, `"warn"`, `"error"`, `"fatal"`
 * @property {String} source default: `"server"`, allowed: `"client"`, `"server"`
 * @property {Boolean} handled required, default: false
 * @property {Object} data, blackbox
 * @property {Date} date required
 */
export const Logs = new SimpleSchema({
  logType: {
    type: String
  },
  shopId: {
    type: String
  },
  level: {
    type: String,
    defaultValue: "info",
    allowedValues: ["trace", "debug", "info", "warn", "error", "fatal"]
  },
  source: {
    type: String,
    defaultValue: "server",
    allowedValues: ["client", "server"]
  },
  handled: {
    type: Boolean,
    defaultValue: false
  },
  data: {
    type: Object,
    blackbox: true,
    label: "Data"
  },
  date: {
    type: Date,
    autoValue() { return new Date(); },
    label: "Date"
  }
});

registerSchema("Logs", Logs);
