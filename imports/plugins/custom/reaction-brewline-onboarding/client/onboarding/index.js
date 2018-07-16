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

  getTemplateName() {
    if (!this.props.workflowStep) { return; }

    const { template } = this.props.workflowStep;

    return template;
  }

  renderTemplate() {
    const template = this.getTemplateName();

    if (!template) { return; }

    const TemplateComponent = Components[template];

    if (!TemplateComponent) { return; }

    return <TemplateComponent onNextStep={this.handleClick} />;
  }

  render() {
    const containerClassName =
      `onboarding__steps-container ${_.kebabCase(this.getTemplateName())}`;

    return (
      <div className="onboarding-container">
        <div className={containerClassName}>
          <Components.Alerts placement="onboarding" />

          {this.renderTemplate()}
        </div>
      </div>
    );
  }
}

function workflowSteps() {
  // const shopId = Reaction.getShopId();
  const shopId = Reaction.getPrimaryShopId();
  const { name } = Router.current().route;
  // use the router to determine the "current" package
  const pkg = Packages.findOne({ shopId, "registry.name": name }) || {};
  // get the workflow from the package (which could have a few workflows)
  const workflow = _.find(pkg.registry, (r) => r.name === name);
  // get the steps corresponding to this workflow
  return _.chain(pkg.layout)
    .filter((l) => !!l.template)
    .filter((l) => l.workflow === workflow.workflow)
    .value();
}

function currentStep(steps = workflowSteps()) {
  const routeStep = Router.getParam("step");

  const step = _.find(steps, (s) => s.path === routeStep);

  return step || steps[0];
}

function thisAndPreviousSteps(steps = workflowSteps()) {
  const step = currentStep(steps);

  // find all steps which come before it
  return _.chain(steps)
    .filter((s) => s.position <= step.position)
    .map((s) => s.template)
    .value();
}

function nextStep(steps = workflowSteps()) {
  const step = currentStep(steps);

  return _.chain(steps)
    .sortBy("position")
    .find((s) => s.position > step.position)
    .value();
}

function handleWorkflowChange(template) {
  const steps = workflowSteps();
  const statuses = thisAndPreviousSteps(steps);
  let { path } = nextStep(steps);

  Meteor.call("onboarding/updateWorkflow", template, statuses);

  if (path) {
    Router.go("brewlineOnboardingBrewery", { step: path });
  } else if (!statuses || !statuses.length) {
    // if statuses is empty, start the onboarding
    Router.go("brewlineOnboardingBrewery");
  } else {
    // looks like you're done... go to last step
    ({ path } = steps[steps.length - 1]);
    Router.go("brewlineOnboardingBrewery", { step: path });
  }
}

function composer(props, onData) {
  let workflowStep;

  if (Meteor.subscribe("Packages", Reaction.getShopId()).ready()) {
    const steps = workflowSteps();

    workflowStep = currentStep(steps);

    if (!workflowStep) {
      // get the current user
      // TODO: generalize with `Collections[pkg.layout[0].collection]`
      const account = Accounts.findOne({ userId: Meteor.userId() });
      // get the current step this user is on
      const completedWorkflowSteps =
        account && account.onboarding && account.onboarding.workflow || [];

      workflowStep = _.chain(steps)
        .sortBy("position")
        .find((s) => !_.includes(completedWorkflowSteps, s.template))
        .value();
    }

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


// import { Components } from "@reactioncommerce/reaction-components";
