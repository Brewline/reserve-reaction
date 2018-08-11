import _ from "lodash";
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Packages } from "/lib/collections";
import { SocialButtons } from "/imports/plugins/included/social/client/components";

export default class ThankYou extends PureComponent {
  static propTypes = {
    done: PropTypes.func,
    merchantShops: PropTypes.arrayOf(PropTypes.shape({
      UntappdId: PropTypes.number
    })),
    watchlistItems: PropTypes.arrayOf(PropTypes.shape({
      displayName: PropTypes.string
    }))
  };

  renderWatchlistItem = (watchlistItem, key) => {
    const { displayName, itemMetadata } = watchlistItem;
    const { contact = {} } = itemMetadata;
    // const { twitter, facebook, instagram } = contact;
    const { twitter, facebook } = contact;

    const socialPackage = Packages.findOne({
      name: "reaction-social"
    });
    const socialSettings = _.get(socialPackage, "settings.public");

    const apps = {};

    if (facebook) {
      const handle = facebook.replace(/^.*\.facebook\.com\//i, "");
      apps.facebook = {
        ...(_.get(socialSettings, "apps.facebook", {})),
        description: `@${handle} do you do can releases online? have you heard of @brewlineHQ?`
      };
    }

    if (twitter) {
      apps.twitter = {
        ...(_.get(socialSettings, "apps.twitter", {})),
        description: `.@${twitter} do you do can releases online? have you heard of @brewlineHQ?`
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
      <div className={`brewery-with-social row-${key % 2}`} key={key}>
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
      <h3>
        None of your favorites are on Brewline yet!
      </h3>
    );
  }

  render() {
    return (
      <div className="onboarding__step brewline-onboarding__thank-you">
        {this.renderFavoritesStats()}

        <Components.Divider />

        <h5>We have a big favor to ask:</h5>

        <p>
          Please share on social to let your favorite Brewers know they should
          be running can releases on Brewline!
        </p>

        {this.renderWatchlistItems()}

        {/*
          <p>
            <strong>One last thing:</strong> Sign up now, and we will keep you up
            to date with your favorite brewers.
          </p>
        */}
      </div>
    );
  }
}
