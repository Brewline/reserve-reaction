import getSlackClient from "slack-notify";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";

const NOTIFICATION_JOB_KEY = "notify/slack";
export function notifyCreationOfWatchlistItem(msg, method, item, notificationOptions = {}) {
  new Job(Jobs, NOTIFICATION_JOB_KEY, {
    msg,
    method,
    item,
    notificationOptions
  }).priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    }).save();
}

export function processWatchlistItemNotifications() {
  Jobs.processJobs(NOTIFICATION_JOB_KEY, {
    pollInterval: 60 * 60 * 1000, // backup polling, see observer below
    workTimeout: 60 * 1000
  }, async (job, callback) => {
    const { data: { item, method, msg, notificationOptions } } = job;
    const { itemId, watchlist, displayName, metadata, label, createdAt } = item;

    const fields = {
      watchlist,
      displayName,
      itemId,
      metadata
    };
    const slackMessageKey = `${method}(${itemId})`;
    /* eslint-disable camelcase */
    const payload = {
      icon_url: label,
      text: `${msg}: ${displayName}`,
      attachments: [
        {
          fallback: slackMessageKey,
          fields: Object.keys(fields).map((title) => {
            let value = fields[title] || null;
            if (value instanceof Object) {
              value = JSON.stringify(value);
            }

            return { title, value, short: (value || "").length < 40 };
          }),
          ts: createdAt && createdAt.getTime ? createdAt.getTime() / 1000 : createdAt,
          ...notificationOptions
        }
      ]
    };
    /* eslint-enable camelcase */

    try {
      await sendSlackMessage(payload);

      job.done(`Finished notifying on ${slackMessageKey}`);
    } catch (error) {
      job.fail(`Failed to notify on ${slackMessageKey}: '${error.message}'`);
    } finally {
      callback();
    }
  });
}

export function sendSlackMessage(payload) {
  return new Promise((resolve, reject) => {
    const slack = getSlackClient(process.env.SLACK_NOTIFICATION_URL__ONBOARDING);

    slack.send(payload, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
