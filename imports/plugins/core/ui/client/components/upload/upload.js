/**
 * uploadHandler method
 */

import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";

function uploadHandler(event, instance) {
  const files = [];

  FS.Utility.eachFile(event, (file) => {
    files.push(new FS.File(file));
  });

  if (instance.data.onUpload) {
    instance.data.onUpload(files, event);
  }

  return files;
}

Template.upload.helpers({
  uploadButtonProps() {
    const instance = Template.instance();
    return {
      className: "btn-block",
      label: instance.data.label || "Drop file to upload",
      i18nKeyLabel: instance.data.i18nKeyLabel || "productDetail.dropFiles",
      onClick() {
        instance.$("input[name=files]").click();
      }
    };
  }
});

Template.upload.events({
  "click #btn-upload"() {
    return $("#files").click();
  },
  "change input[name=files]": uploadHandler,
  "dropped .js-dropzone": uploadHandler
});
