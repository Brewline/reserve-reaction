import React, { Component } from "react";
import PropTypes from "prop-types";
import Measure from "react-measure";
import update from "immutability-helper";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import _ from "lodash";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Meteor } from "meteor/meteor";
import { Logger, Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";

const wrapComponent = (Comp) => (
  /**
   * ProductMediaGallery
   */
  class ProductMediaGallery extends Component {
    static propTypes = {
      editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
      id: PropTypes.string,
      media: PropTypes.arrayOf(PropTypes.object),
      placement: PropTypes.string
    }

    // Load first image as featuredImage
    constructor(props) {
      super(props);

      this.state = {
        dimensions: {
          width: -1,
          height: -1
        },
        featuredMedia: null,
        media: null,
        uploadProgress: null
      };
    }

    static getDerivedStateFromProps(props) {
      return {
        media: props.media
      };
    }

    handleSetMediaPriority = (media, priority) => {
      Meteor.call("media/updatePriority", media._id, priority, (error) => {
        if (error) {
          // Go back to using media prop instead of media state so that it doesn't appear successful
          this.setState({ media: this.props.media });

          Alerts.toast(error.reason, "warning", {
            autoHide: 10000
          });
        }
      });
    }

    handleRemoveMedia = (media) => {
      const imageUrl = media.url({ store: "medium" });
      const mediaId = media._id;

      Alerts.alert({
        title: "Remove Media?",
        type: "warning",
        showCancelButton: true,
        imageUrl,
        imageHeight: 150
      }, (isConfirm) => {
        if (isConfirm) {
          Meteor.call("media/remove", mediaId, (error) => {
            if (error) {
              Alerts.toast(error.reason, "warning", {
                autoHide: 10000
              });
            }
          });
        }
        // show media as removed (since it will not disappear until changes are published
      });
    };

    get media() {
      return this.state.media;
    }

    handleMouseEnterMedia = (event, media) => {
      const { editable } = this.props;

      // It is confusing for an admin to know what the actual featured media is if it
      // changes on hover of the other media.
      if (!editable) {
        this.setState({ featuredMedia: media });
      }
    };

    handleMouseLeaveMedia = () => {
      const { editable } = this.props;

      // It is confusing for an admin to know what the actual featured media is if it
      // changes on hover of the other media.
      if (!editable) {
        this.setState({ featuredMedia: null });
      }
    };

    handleMoveMedia = (dragIndex, hoverIndex) => {
      const mediaList = this.media;
      const media = mediaList[dragIndex];

      // Apply new sort order to variant list
      const newMediaOrder = update(mediaList, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, media]
        ]
      });

      // Set local state so the component does't have to wait for a round-trip
      // to the server to get the updated list of variants
      this.setState({ media: newMediaOrder });

      // Save the updated positions
      const sortedMediaIDs = newMediaOrder.map(({ _id }) => _id);
      Meteor.call("media/updatePriorities", sortedMediaIDs, (error) => {
        if (error) {
          // Go back to using media prop instead of media state so that it doesn't appear successful
          this.setState({ media: this.props.media });

          Alerts.toast(error.reason, "warning", {
            autoHide: 10000
          });
        }
      });
    };

    handleUpload = (files) => {
      const { productId, variantId, shopId, userId } = this.props;

      let count = Media.findLocal({
        "metadata.variantId": variantId
      }).length;

      for (const file of files) {
        // Convert it to a FileRecord
        const fileRecord = FileRecord.fromFile(file);

        // Set metadata
        fileRecord.metadata = {
          ownerId: userId,
          productId,
          variantId,
          shopId,
          priority: count,
          toGrid: 1 // we need number
        };

        count += 1;

        // Listen for upload progress events
        fileRecord.on("uploadProgress", (uploadProgress) => {
          this.setState({ uploadProgress });
        });

        // Do the upload. chunkSize is optional and defaults to 5MB
        fileRecord.upload({})
          // We insert only AFTER the server has confirmed that all chunks were uploaded
          .then(() => {
            Meteor.call("media/insert", fileRecord.document, (error) => {
              if (error) Alerts.toast(error.reason, "error");
              this.setState({ uploadProgress: null });
            });
            return null;
          })
          .catch((error) => {
            this.setState({ uploadProgress: null });
            Logger.error(error);
          });
      }
    };

    render() {
      const { width, height } = this.state.dimensions;

      return (
        <Measure
          bounds
          onResize={(contentRect) => {
            this.setState({ dimensions: contentRect.bounds });
          }}
        >
          {({ measureRef }) =>
            <div ref={measureRef}>
              <Comp
                featuredMedia={this.state.featuredMedia}
                onDrop={this.handleUpload}
                onMouseEnterMedia={this.handleMouseEnterMedia}
                onMouseLeaveMedia={this.handleMouseLeaveMedia}
                onMoveMedia={this.handleMoveMedia}
                onSetMediaPriority={this.handleSetMediaPriority}
                onRemoveMedia={this.handleRemoveMedia}
                {...this.props}
                media={this.media}
                mediaGalleryHeight={height}
                mediaGalleryWidth={width}
                uploadProgress={this.state.uploadProgress}
              />
            </div>
          }
        </Measure>
      );
    }
  }
);

/**
 * resort the media in
 * @param {Array<Object>} media media to sort by priority
 * @returns {Array<Object>} sorted media
 */
function sortMedia(media) {
  const sortedMedia = _.sortBy(media, (m) => {
    const { priority } = (m && m.metadata) || {};
    if (!priority && priority !== 0) {
      return 1000;
    }
    return priority;
  });
  return sortedMedia;
}

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const { productId, variantId } = props;

  let selector = {
    "metadata.variantId": {
      $in: [variantId]
    }
  };

  // Find images for the top-level product that aren't assigned to
  // a specific variant
  if (productId && !variantId) {
    selector = {
      $and: [
        {
          "metadata.productId": {
            $in: [productId]
          }
        },
        {
          "metadata.variantId": null
        }
      ]
    };
  }

  const media = Media.findLocal(selector, {
    sort: {
      "metadata.priority": 1
    }
  });

  onData(null, {
    editable: Reaction.hasPermission(props.permission || ["createProduct"]),
    media: sortMedia(media),
    userId: Reaction.getUserId(),
    shopId: Reaction.getShopId(),
    productId,
    variantId
  });
}

export default compose(
  composeWithTracker(composer),
  wrapComponent
);
