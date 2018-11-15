// Component for a VelocityTransitionGroup that crossfades between its children.
//
// To use this component, render with a single child that contains the "loading" version of your
// UI. When data has loaded, switch the "key" of this child so that React considers it a brand
// new element and triggers the enter / leave effects. The two versions of the UI are expected to
// have identical heights.
//
// Properties on this component (such as "style") are applied to the VelocityTransitionGroup
// component that this delegates to. We set the VelocityTransitionGroup's container to a <div> by
// default, and provide enter and leave animations, though these could be overridden if it makes
// sense for your use case. A position: 'relative' style is also applied by default since the loading
// effect requires position: 'absolute' on the child.
//
// This component defines a "duration" property that is used for both the enter and leave animation
// durations.
//
// Use the property "isOpaque" if the children have isOpaque backgrounds. This will make the new element
// come in 100% opacity and fade the old element out from on top of it. (Without this, isOpaque
// elements end up bleeding the background behind the LoadingCrossfadeComponent through.)

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { VelocityTransitionGroup } from "velocity-react";

export default class LoadingCrossfadeComponent extends PureComponent {
  static propTypes = {
    // At most 1 child should be supplied at a time, though the animation does correctly handle
    // elements moving in and out faster than the duration (so you can have 2 leaving elements
    // simultaneously, for example).
    children: PropTypes.element,
    duration: PropTypes.number,
    isOpaque: PropTypes.bool,
    style: PropTypes.object
  };

  static defaultProps = {
    duration: 350
  };

  render() {
    // We pull style out explicitly so that we can merge the position: 'relative' over any provided
    // value. position: 'relative' lets us absolutely-position the leaving child during the fade.
    const style = _.defaults((this.props.style || {}), { position: "relative" });

    const transitionGroupProps = _.defaults(_.omit(this.props, _.keys(this.constructor.propTypes), "style"), {
      component: "div",
      style,

      enter: {
        animation: { opacity: 1 },
        duration: this.props.duration,
        style: {
          // If we're animating isOpaque backgrounds then we just render the new element under the
          // old one and fade out the old one. Without this, at e.g. the crossfade midpoint of
          // 50% opacity for old and 50% opacity for new, the parent background ends up bleeding
          // through 25%, which makes things look not smooth at all.
          opacity: this.props.isOpaque ? 1 : 0,

          // We need to clear out all the styles that "leave" puts on the element.
          position: "relative",
          top: "",
          left: "",
          bottom: "",
          right: "",
          zIndex: ""
        }
      },

      leave: {
        animation: { opacity: 0 },
        duration: this.props.duration,
        style: {
          // 'absolute' so the 2 elements overlap for a crossfade
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 1
        }
      }
    });

    return React.createElement(VelocityTransitionGroup, transitionGroupProps, this.props.children);
  }
}
