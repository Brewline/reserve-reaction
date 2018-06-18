import "./onboarding";
import "./index.less";

import classnames from "classnames";
import React from "react";
import { getComponent, registerComponent } from "@reactioncommerce/reaction-components";

// TODO: replace shell Blaze Template w/React
import Blaze from "meteor/gadicc:blaze-react-component";
import { Template } from "meteor/templating";
import { CoreLayout } from "../../../core/layout/client";

class OnboardingLayout extends CoreLayout {
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
