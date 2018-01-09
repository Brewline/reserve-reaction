import { Jobs, Media } from "/lib/collections";

export const importImages = () => {
  Jobs.processJobs("connectors/untappd/import/image", {
    pollInterval: 60 * 60 * 1000, // Retry failed images after an hour
    workTimeout: 5 * 1000 // No image import should last more than 5 seconds
  }, (job, callback) => {
    const { shopId, url, metadata } = job.data;

    try {
      const fileObj = new FS.File();
      fileObj.attachData(url);

      // Set workflow to "published" to bypass revision control on insert for this image.
      fileObj.metadata = { ...metadata, workflow: "published" };
      const media = Media.insert(fileObj);
      // Logger.info(`Image inserted from ${url} into ${metadata}`);

      // TODO: figure out how to listen for this job's completion to separate
      // this code out

      // set the media as the Nav Bar Image
      // TODO: ensure it's not already set?
      if (media) {
        Collections.Shops.update({
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

      job.done(`Finished importing image from ${url}`);
      callback();
    } catch (error) {
      job.fail(`Failed to import image from ${url}.`);
      callback();
    }
  });
};
