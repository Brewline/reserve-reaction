// Log DB Queries
// *** Warning, this does not capture calls to the Meteor-defined
// /<Collection>/<action> methods, which don't seem to be heavily utilized in
// this project.

import { Mongo } from "meteor/mongo";
// import { MongoInternals } from "meteor/mongo";
import Logger from "@reactioncommerce/logger";

export const Colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m"
};

export default function DbTiming({ excludes = [], withData = true, mongoStyle = false }) {
  // be smarter about this... per-request would help
  DbTiming.aggregateQueryTime = {};

  const methods = {
    find: { data: false },
    findOne: { data: false },
    insert: { data: true },
    update: { data: true },
    remove: { data: false },
    upsert: { data: true },
    aggregate: { data: false }
  };
  Object.keys(methods).forEach((method) => {
    // const originalMethod = MongoInternals.Connection.prototype.prototype[method];
    const originalMethod = Mongo.Collection.prototype[method];

    Mongo.Collection.prototype[`_untimed_${method}`] = originalMethod;

    Mongo.Collection.prototype[method] = function (...args) {
      const query = args[0];
      const data = withData && methods[method].data && args[1];
      let callback = args[args.length - 1];
      const startTime = process.hrtime();

      const timingCallback = (...callbackArgs) => {
        const time = process.hrtime(startTime);
        const timeMicroSeconds = time[0] * 1e6 + Math.round(time[1] / 1e3);
        const timeSeconds = time[0] + time[1] / 1e9;
        let collectionMethod;
        if (mongoStyle) {
          collectionMethod = `db.getCollection('${this._name}').${method}`;
        } else {
          collectionMethod = `${this._name}.${method}`;
        }
        const stringifiedQuery = JSON.stringify(query);
        const cacheKey = `${collectionMethod}:${stringifiedQuery}`;

        if (excludes.indexOf(collectionMethod) >= 0) { return; }
        if (excludes.indexOf(cacheKey) >= 0) { return; }

        const { count, time: total } =
          updateAggregate(DbTiming.aggregateQueryTime, cacheKey, timeSeconds);

        let dataDisplay;
        if (data) {
          dataDisplay = `, ${JSON.stringify(data)}`;
        } else {
          dataDisplay = "";
        }

        const queryDisplay = query ? stringifiedQuery : "";

        Logger.info([
          countAndTotalLog(count, total),
          timingLog(timeMicroSeconds),
          `${collectionMethod}(${Colors.Dim}${Colors.FgGreen}${queryDisplay}${Colors.Reset}${Colors.Dim}${dataDisplay}${Colors.Reset})`
        ].join(" | "));

        if (callback) {
          return callback.call(null, ...callbackArgs);
        }
      };

      if (typeof callback === "function") {
        // replace the callback in the args
        args[args.length - 1] = timingCallback;

        return originalMethod.call(this, ...args);
      }

      const result = originalMethod.call(this, ...args);

      callback = null;
      timingCallback();

      return result;
    };
  });
}

function pad(str, length) {
  if (str.length >= length) { return str; }

  return `${Array(length).join(" ")}${str}`.slice(0 - length);
}

function countAndTotalLog(count, total) {
  let countColor;
  let totalColor;

  if (count > 10) {
    countColor = Colors.FgRed;
  } else if (count > 5) {
    countColor = Colors.FgYellow;
  } else {
    countColor = Colors.Reset;
  }

  if (total > 10) {
    totalColor = Colors.FgRed;
  } else if (total > 5) {
    totalColor = Colors.FgYellow;
  } else {
    totalColor = Colors.Reset;
  }

  const paddedCount = pad(count.toLocaleString(), 3);
  const paddedTotal = pad(total.toLocaleString(), 5);

  return `Σ(${countColor}${paddedCount}${Colors.Reset}/${totalColor}${paddedTotal}s${Colors.Reset})`;
}

function timingLog(timeMicroSeconds) {
  let timeColor;

  if (timeMicroSeconds > 1e6) {
    timeColor = Colors.BgRed;
  } else if (timeMicroSeconds > 1e5) {
    timeColor = Colors.BgYellow;
  } else {
    timeColor = Colors.Reset;
  }

  const paddedTime = pad(timeMicroSeconds.toLocaleString(), 6);

  return `${timeColor}${paddedTime}µs${Colors.Reset}`;
}

function updateAggregate(aggregateQueryTime, cacheKey, timeSeconds) {
  if (!(cacheKey in aggregateQueryTime)) {
    aggregateQueryTime[cacheKey] = {
      count: 0,
      time: 0
    };
  }

  aggregateQueryTime[cacheKey].count += 1;
  aggregateQueryTime[cacheKey].time += timeSeconds;

  return aggregateQueryTime[cacheKey];
}
