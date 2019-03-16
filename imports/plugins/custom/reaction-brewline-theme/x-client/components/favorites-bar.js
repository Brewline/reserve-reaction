// TODO: move to brewline-watchlist

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  VelocityComponent,
  VelocityTransitionGroup
} from "velocity-react";
import { Components } from "@reactioncommerce/reaction-components";

import { a11yOnEnter } from "../lib";
import LoadingCrossfadeComponent from "./loading-crossfade-component";

export default class FavoritesBar extends Component {
  static propTypes = {
    favorites: PropTypes.arrayOf(PropTypes.shape({
      displayName: PropTypes.string,
      label: PropTypes.string
    })),
    isDefaultExpanded: PropTypes.bool,
    onClickEmpty: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      expanded: props.isDefaultExpanded,
      favorites: null,
      duration: 500
    };
  }

  componentWillUnmount() {
    window.clearTimeout(this.favoriteTimeout);
  }

  onToggle = () => {
    if (this.state.expanded) {
      this.setState({
        expanded: false,
        uiDisplayFavorites: false
      });

      window.clearTimeout(this.favoriteTimeout);
    } else {
      this.setState({
        expanded: true,
        uiDisplayFavorites: false
      });

      this.favoriteTimeout =
        window.setTimeout(this.loadFavorites, this.state.duration * 1.5);
    }
  };

  loadFavorites = () => {
    this.setState({
      uiDisplayFavorites: true
    });
  };

  renderFavoriteLabel(favorite) {
    const { label, displayName } = favorite;

    let img;

    if (label) {
      img = (
        <img
          className="loaded-content"
          src={label}
          alt={displayName}
        />
      );
    }

    return (
      <span
        className="loading-placeholder-dark loading-placeholder-full favorites-bar__item__label"
        style={{ height: 32, width: 32 }}
      >
        {img}
      </span>
    );
  }

  renderFavorite = (favoriteToRender, i) => {
    const favorite = favoriteToRender || {};

    let nameClassName = "favorites-bar__item__name flex-1";
    if (!favorite.displayName) {
      nameClassName += "loading-placeholder-dark loading-placeholder-full";
    }

    return (
      <div className="favorites-bar__item flex-box align-items-center" key={i}>
        {this.renderFavoriteLabel(favorite)}

        <div className={nameClassName}>
          {favorite.displayName}
        </div>
      </div>
    );
  };

  renderNoFavorites() {
    const placeholder = {
      displayName: "No favorites yet"
    };

    return (
      <div key="no-favorites" className="favorites-bar__list">
        {this.renderFavorite(placeholder, "no-favorites")}
      </div>
    );
  }

  renderFavorites() {
    const { favorites } = this.props;

    if (!favorites || !favorites.length) {
      return this.renderNoFavorites();
    }

    let key;
    let favoriteItems;
    if (this.state.uiDisplayFavorites) {
      favoriteItems = favorites;
      key = "favorites";
    } else {
      favoriteItems = Array(...Array(favorites.length));
      key = "loading";
    }

    return (
      <LoadingCrossfadeComponent duration={this.state.duration * 0.75} key="content">
        <div key={key} className="favorites-bar__list">
          {favoriteItems.map(this.renderFavorite)}
        </div>
      </LoadingCrossfadeComponent>
    );
  }

  render() {
    const { favorites = [] } = this.props;

    return (
      <div className="favorites-bar flex-box flex-1 flex-column align-items-stretch">
        <div
          className="favorites-bar__header flex-box justify-content-space-between user-select-none"
          role="button"
          tabIndex={0}
          onClick={this.onToggle}
          onKeyDown={a11yOnEnter(this.onToggle)}
        >
          Favorites (tap to expand)

          <span>
            <VelocityComponent
              animation={{ rotateZ: this.state.expanded ? 0 : -360 }}
              duration={this.state.duration}
            >
              <Components.Icon icon="star" />
            </VelocityComponent>
            ({favorites.length})
          </span>
        </div>

        <div className="flex-1">
          <VelocityTransitionGroup
            component="div"
            className="favorites-bar__transition-group"
            enter={{
              animation: "slideDown",
              duration: this.state.duration,
              style: { height: "" }
            }}
            leave={{
              animation: "slideUp",
              duration: this.state.duration
            }}
          >
            {this.state.expanded ? this.renderFavorites() : null}
          </VelocityTransitionGroup>
        </div>
      </div>
    );
  }
}
