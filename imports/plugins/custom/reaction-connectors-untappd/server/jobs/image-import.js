import { FileRecord } from "@reactioncommerce/file-collections";
import { Catalog, Jobs, Shops } from "/lib/collections";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Media } from "/imports/plugins/core/files/server";
import getCatalogProductMedia from "/imports/plugins/core/catalog/server/no-meteor/utils/getCatalogProductMedia";
import fetch from "node-fetch";

async function addMediaFromUrl({ url, metadata }) {
  const fileRecord = await FileRecord.fromUrl(url, { fetch });

  // Set workflow to "published" to bypass revision control on insert for this image.
  fileRecord.metadata = { ...metadata, workflow: "published" };

  return Media.insert(fileRecord);
}

const afterImageResizeJobs =
  "connectors/untappd/import/product/image/after-resize";

function processAfterImageResizeJobs() {
  return Jobs.processJobs(afterImageResizeJobs, {
    pollInterval: 30 * 1000 // Retry failed images after a minute
  }, async (job, callback) => {
    const { data } = job;
    try {
      const { metadata: { productId, toGrid } } = data;

      // check to see whether product is already published, and update catalog
      if (toGrid !== 1) {
        job.cancel(`image is not for grid: toGrid={${toGrid}}`);
        return;
      }

      const media = await getCatalogProductMedia(productId, { Media });
      const primaryImage = media[0];

      if (!primaryImage || !primaryImage.URLs || !primaryImage.URLs.large) {
        job.fail(`waiting for image resize to complete for product ${productId}`);
        return;
      }
      if (primaryImage.URLs.large === "null") {
        job.fail(`received null primary image URL: ${JSON.stringify(primaryImage)} (usually means image not resized yet)`);
        return;
      }

      Catalog.update(
        { "product._id": productId },
        { $set: { "product.primaryImage": primaryImage } }
      );

      job.done(`Finished importing image from ${data.url}`);
    } catch (error) {
      job.fail(`Failed to import image from ${data.url}: '${error.message}'`);
    } finally {
      callback();
    }
  });
}

export async function processImportProductImagesJobs() {
  return Jobs.processJobs("connectors/untappd/import/product/image", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 30 * 1000 // No image import should last more than 30 seconds?
  }, async (job, callback) => {
    const { data } = job;

    try {
      const media = await addMediaFromUrl(data);

      if (!media) {
        job.fail(`Failed to save media from ${data.url}`);
      }

      const { metadata } = data;
      const { toGrid } = metadata;

      if (toGrid === 1) {
        new Job(Jobs, afterImageResizeJobs, { metadata })
          .priority("normal")
          .retry({
            retries: 30,
            wait: 2500 // start with 1 second
          }).save();

        processAfterImageResizeJobs();
      }

      job.done(`Finished importing image from ${data.url}`);
    } catch (error) {
      job.fail(`Failed to import image from ${data.url}: '${error.message}'`);
    } finally {
      callback();
    }
  });
}

export async function processImportShopImagesJobs() {
  return Jobs.processJobs("connectors/untappd/import/shop/image", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 5 * 1000 // No image import should last more than 5 seconds
  }, async (job, callback) => {
    const { data } = job;

    try {
      const media = await addMediaFromUrl(data);

      // TODO: figure out how to listen for this job's completion to separate
      // this code out

      // set the media as the Nav Bar Image
      // TODO: ensure it's not already set?
      if (media) {
        const { shopId } = data;
        Shops.update({
          _id: shopId
        }, {
          $push: {
            brandAssets: {
              mediaId: media._id,
              type: "navbarBrandImage"
            }
          }
        });
      }

      job.done(`Finished importing image from ${data.url}`);
      callback();
    } catch (error) {
      job.fail(`Failed to import image from ${data.url}: '${error.message}'`);
      callback();
    }
  });
}
