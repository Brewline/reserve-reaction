import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import {
  Components,
  composeWithTracker,
  registerComponent
} from "@reactioncommerce/reaction-components";
import { Modal } from "@brewline/theme/client/components";

import UntappdMarketplaceShop from "./untappd-marketplace-shop-component";

class UntappdMarketplaceShopContainer extends Component {
  static propTypes = {
    brewery: PropTypes.shape({
      brewery_name: PropTypes.string // eslint-disable-line camelcase
    })
  };

  state = {};

  getShopName(defaultValue) {
    const {
      brewery: {
        brewery_name: breweryName
      }
    } = this.props;

    return breweryName || defaultValue;
  }

  getShopSlug(defaultValue) {
    const {
      brewery: {
        brewery_slug: brewerySlug
      }
    } = this.props;

    return brewerySlug || defaultValue;
  }

  addShop = () => {
    const msg = `Importing ${this.getShopName("your shop")} from Untappd...`;
    Alerts.toast(msg, "info");

    const untappdShopId = this.state.requestedUntappdShopId;
    const ownerEmailAddress = this.emailRef ? this.emailRef.value : null;

    Meteor.call("connectors/untappd/import/shops", untappdShopId, ownerEmailAddress, (err, shop) => {
      if (err) {
        // TODO: correct wording
        return Alerts.toast(err.reason, "error");
      }

      // TODO: correct wording
      Alerts.toast(`${this.getShopName("Shop")} created`, "success");

      Reaction.setShopId(shop._id);
    });
  }

  requestPromptForEmailAddress = (untappdShopId) => {
    this.setState({
      shouldShopEmailPrompt: true,
      requestedUntappdShopId: untappdShopId
    });
  }

  cancelPromptForEmailAddress = () => {
    this.setState({
      shouldShopEmailPrompt: false,
      requestedUntappdShopId: null
    });
  }

  render() {
    return (
      <Fragment>
        <UntappdMarketplaceShop
          {...this.props}
          onAddShop={this.requestPromptForEmailAddress}
        />

        <Modal
          isOpen={this.state.shouldShopEmailPrompt}
          onRequestClose={this.cancelPromptForEmailAddress}
          size="sm"
        >
          <form>
            <label className="rui textfield">
              Set the owner email address (optional)
              <input
                ref={(ref) => { this.emailRef = ref; }}
                placeholder={`${this.getShopSlug("brewery")}@brewline.io (or something)`}
              />
            </label>

            <Components.Button
              bezelStyle="solid"
              className={{
                btn: true
              }}
              label="Use this email"
              onClick={this.addShop}
              primary={true}
            />
          </form>
        </Modal>
      </Fragment>
    );
  }
}

function composer(props, onData) {
  onData(null, props);
}

registerComponent(
  "UntappdMarketplaceShop",
  UntappdMarketplaceShopContainer,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(UntappdMarketplaceShopContainer);
