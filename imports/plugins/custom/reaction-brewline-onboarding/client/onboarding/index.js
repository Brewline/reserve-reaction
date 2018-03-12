import "./onboarding.html";

import "./brewery";
// import "./consumer";


import _ from "lodash";
import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Reaction } from "/client/api";
import { Accounts, Packages } from "/lib/collections";
import {
  Components,
  composeWithTracker,
  registerComponent
} from "@reactioncommerce/reaction-components";
import { Router } from "/client/modules/router";

// HOC to provide templates and user state
// export default class Onboarding extends Component {
class Onboarding extends Component {
  handleClick = () => {
    if (!this.props.onWorkflowChange) { return; }

    const { workflow, template } = this.props.workflowStep;

    if (!workflow || !template) { return; }

    this.props.onWorkflowChange(workflow, template);
  }

  renderTemplate() {
    if (!this.props.workflowStep) { return; }

    let { template } = this.props.workflowStep;

    if (!template) { return; }

    const Component = Components[template];

    if (!Component) { return; }

    return <Component onNextStep={this.handleClick} />;
  }

  render() {
    return (
      <div>
        <Components.Alerts placement="onboarding" />

        {this.renderTemplate()}
      </div>
    );
  }
}

function thisAndPreviousSteps(workflow, step) {
  const shopId = Reaction.getShopId();
  const { name } = Router.current().route;
  // use the router to determine the "current" package
  const pkg = Packages.findOne({ shopId, "registry.name": name }) || {};
  // get the steps correspondingn to this workflow
  const steps = _.chain(pkg.layout)
    .filter(l => !!l.template)
    .filter(l => l.workflow === workflow)
    .value();
  // find the current step
  const currentStep = _.find(steps, s => s.template === step);
  // find all steps which come before it
  return _.chain(steps)
    .filter(s => s.position <= currentStep.position)
    .map(s => s.template)
    .value();
}

const handleWorkflowChange = (workflow, template) => {
  const statuses = thisAndPreviousSteps(workflow, template);

  Meteor.call("onboarding/updateWorkflow", template, statuses);
};

function composer(props, onData) {
  let workflowStep;

  if (Meteor.subscribe("Packages", Reaction.getShopId()).ready()) {
    const shopId = Reaction.getShopId();
    const { name } = Router.current().route;
    // use the router to determine the "current" package
    const pkg = Packages.findOne({ shopId, "registry.name": name }) || {};
    // get the workflow from the package (which could have a few workflows)
    const workflow = _.find(pkg.registry, r => r.name === name);
    // get the steps correspondingn to this workflow
    const steps = _.chain(pkg.layout)
      .filter(l => !!l.template)
      .filter(l => l.workflow === workflow.workflow)
      .value();
    // get the current user
    // TODO: generalize with `Collections[pkg.layout[0].collection]`
    const account = Accounts.findOne({ userId: Meteor.userId(), shopId });
    // get the current step this user is on
    const completedWorkflowSteps =
      account && account.onboarding && account.onboarding.workflow || [];

    // there seems to be a race condition, where sometimes we re-render before
    // an account has its workflow updated. In those cases, the user is sent
    // to the beginning of the workflow. Should we update the URL to help?
    // if (!completedWorkflowSteps.length) {
    //   if (Reaction.getShop().shopType !== "primary") {
    //     workflowStep = "OnboardingBreweryProducts";
    //   } else if (false) {
    //     workflowStep = "OnboardingBrewerySearch";
    //   }
    // } else {
      // find the first step the user has not completed
      workflowStep = _.chain(steps)
        .sortBy("position")
        .find(s => !_.includes(completedWorkflowSteps, s.template))
        .value();
    // }

    // is this the right place? seems like no, but :shrug:
    if (!workflowStep) {
      Router.go("/");
    }
  }

  onData(null, {
    ...props,
    onWorkflowChange: handleWorkflowChange,
    workflowStep
  });
}

registerComponent(
  "BrewlineOnboarding",
  Onboarding,
  composeWithTracker(composer)
);

export default composeWithTracker(composer)(Onboarding);



import { Template } from "meteor/templating";
// import { Components } from "@reactioncommerce/reaction-components";

Template.brewlineOnboarding.helpers({
  templateProps() {
    return { component: Components.BrewlineOnboarding };
  }
});
