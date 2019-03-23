import _ from "lodash";
import React, { Fragment, PureComponent } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Packages } from "/lib/collections";
import { VelocityComponent } from "velocity-react";
import { Button } from "/imports/plugins/core/ui/client/components";
import { Modal } from "@brewline/theme/client/components";
import SocialButtons from "./social-buttons";

export default class ThankYou extends PureComponent {
  static propTypes = {
    done: PropTypes.func,
    loggedInUser: PropTypes.object,
    merchantShops: PropTypes.arrayOf(PropTypes.shape({
      UntappdId: PropTypes.number
    })),
    onCancelSignUp: PropTypes.func.isRequired,
    onRequestSignUp: PropTypes.func.isRequired,
    shouldShowAuthModal: PropTypes.bool,
    watchlistItems: PropTypes.arrayOf(PropTypes.shape({
      displayName: PropTypes.string
    }))
  };

  renderWatchlistItem = (watchlistItem, index) => {
    const { displayName, itemMetadata } = watchlistItem;
    const { contact = {} } = itemMetadata;
    const { twitter, facebook } = contact;

    const socialPackage = Packages.findOne({ name: "reaction-social" });
    const socialSettings = _.get(socialPackage, "settings.public");

    const apps = {};

    if (twitter) {
      apps.twitter = {
        ...(_.get(socialSettings, "apps.twitter", {})),
        description: `.@${twitter} do you do can releases online? have you heard of @brewlineHQ?`
      };
    }

    if (facebook) {
      const handle = facebook.replace(/^.*\.facebook\.com\//i, "");
      apps.facebook = {
        ...(_.get(socialSettings, "apps.facebook", {})),
        description: `@${handle} do you do can releases online? have you heard of @brewlineHQ?`
      };
    }

    const shareSettings = {
      description: "Reserve Online. Skip the Line. Brewline.",
      title: "Online Can Release Reservations by Brewline",
      url: "https://reserve.brewline.io/welcome/brewery",
      settings: { apps },
      providers: Object.keys(apps)
    };

    return (
      <div className={`brewery-with-social row-${index % 2}`} key={index}>
        <div className="display-name">
          {displayName}
        </div>

        <div className="sharing-options flex align-items-center">
          <span className="nudge">Please share:</span>
          <SocialButtons {...shareSettings} />
        </div>
      </div>
    );
  }

  renderWatchlistItems() {
    const { watchlistItems } = this.props;

    return (
      <div className="watchlist-container">
        {_.map(watchlistItems, this.renderWatchlistItem)}
      </div>
    );
  }

  renderFavoritesStats() {
    // TODO: figure out if any are on the platform
    return (
      <div className="brewery-favorite-summary">
        <p className="brewery-count">0</p>
        <p>
          of your favorites are on Brewline
        </p>
      </div>
    );
  }

  renderCallToAction() {
    return (
      <Fragment>
        <h3>Get Notified</h3>

        <p>
          Sign up now, and we will let you know when your favorite brewers
          start running can releases on Brewline.
        </p>

        <VelocityComponent animation="callout.shake" runOnMount={true}>
          <Button
            bezelStyle="solid"
            className={{
              "btn": true,
              "btn-lg": true,
              "btn-success": true
            }}
            onClick={this.props.onRequestSignUp}
            primary={true}
          >
            Notify me
          </Button>
        </VelocityComponent>

        <Modal
          isOpen={this.props.shouldShowAuthModal}
          onRequestClose={this.props.onCancelSignUp}
          size="sm"
        >
          <Components.Login
            loginFormCurrentView="loginFormSignUpView"
          />
        </Modal>
      </Fragment>
    );
  }

  renderCallToActionComplete() {
    return (
      <Fragment>
        <h3>All Set!</h3>

        <p>
          You will not be notified when your favorite brewers are up and running
          can releases on Brewline.
        </p>
      </Fragment>
    );
  }

  render() {
    let callToActionContent;
    const { loggedInUser } = this.props;
    const isLoggedIn = !_.isEmpty(loggedInUser);

    if (isLoggedIn) {
      callToActionContent = this.renderCallToActionComplete();
    } else {
      callToActionContent = this.renderCallToAction();
    }
    return (
      <div className="onboarding__step brewline-onboarding__thank-you">
        {this.renderFavoritesStats()}

        <Components.Divider />

        {callToActionContent}

        <p>&nbsp;</p>

        <h5>
          {isLoggedIn ? "One Last Thing" : "Help Us Get the Word Out"}
        </h5>

        <p>
          Share on social to let your favorite Brewers know they should
          be running can releases on Brewline!
        </p>

        {this.renderWatchlistItems()}
      </div>
    );
  }
}
