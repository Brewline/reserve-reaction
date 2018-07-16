import { FileRecord } from "@reactioncommerce/file-collections";
import { Jobs, Shops } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/server";
import fetch from "node-fetch";

async function addMediaFromUrl({ url, metadata }) {
  const fileRecord = await FileRecord.fromUrl(url, { fetch });

  // Set workflow to "published" to bypass revision control on insert for this image.
  fileRecord.metadata = { ...metadata, workflow: "published" };

  return Media.insert(fileRecord);
}

// TODO: rename to processImportProductImagesJobs
export const importProductImages = () => {
  Jobs.processJobs("connectors/untappd/import/product/image", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 5 * 1000 // No image import should last more than 5 seconds
  }, (job, callback) => {
    const { data } = job;

    try {
      Promise.await(addMediaFromUrl(data));

      job.done(`Finished importing image from ${data.url}`);
      callback();
    } catch (error) {
      job.fail(`Failed to import image from ${data.url}: '${error.message}'`);
      callback();
    }
  });
};

// TODO: rename to processImportShopImagesJobs
export const importShopImages = () => {
  Jobs.processJobs("connectors/untappd/import/shop/image", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 5 * 1000 // No image import should last more than 5 seconds
  }, (job, callback) => {
    const { data } = job;

    try {
      const media = Promise.await(addMediaFromUrl(data));

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
};
