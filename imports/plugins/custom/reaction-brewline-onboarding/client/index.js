import "./onboarding";
import "./index.less";

import classnames from "classnames";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { getComponent, registerComponent } from "@reactioncommerce/reaction-components";

// TODO: replace shell Blaze Template w/React
import Blaze from "meteor/gadicc:blaze-react-component";
import { Template } from "meteor/templating";
// import { CoreLayout } from "../../../core/layout/client";

class OnboardingLayout extends Component {
  static propTypes = {
    data: PropTypes.object,
    structure: PropTypes.object
  };

  // copied verbatim from CoreLayout
  constructor(props) {
    super(props);

    const { structure } = this.props;
    const { layoutHeader, layoutFooter } = structure || {};

    const headerComponent = layoutHeader && getComponent(layoutHeader);
    const footerComponent = layoutFooter && getComponent(layoutFooter);

    if (headerComponent) {
      this.headerComponent = React.createElement(headerComponent, {});
    }

    if (footerComponent) {
      this.footerComponent = React.createElement(footerComponent, {});
    }
  }

  render() {
    const { structure } = this.props;
    const { template } = structure || {};

    const pageClassName = classnames({
      "page": true,
      "show-settings": false,
      "brewline-onboarding": true
    });

    let mainNode = null;
    try {
      const mainComponent = getComponent(template);
      mainNode = React.createElement(mainComponent, {});
    } catch (error) {
    //  Probe for Blaze template (legacy)
      if (Template[template]) {
        mainNode = <Blaze template={template} />;
      }
    }

    return (
      <div className={pageClassName} id="reactionAppContainer">
        {this.headerComponent}

        <main>
          {mainNode}
        </main>

        {this.footerComponent}
      </div>
    );
  }
}
registerComponent("onboardingLayout", OnboardingLayout);

export default OnboardingLayout;
