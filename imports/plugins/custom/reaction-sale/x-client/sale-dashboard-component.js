import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

import SaleForm from "./sale-form-container";

export default class SaleDashboard extends Component {
  static propTypes = {
    sales: PropTypes.arrayOf(PropTypes.object)
  };

  renderCanReleases() {
    const { sales } = this.props;

    if (sales === undefined) {
      return (
        <div className="panel-body">
          <p>
            This feature is in active development and is the most important
            thing we are working on right now. We will email you with updates.
          </p>
        </div>
      );
    }

    return null;
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading panel-heading-flex">
          <div className="panel-title">
            <i className="fa fa-beer" />
            Can Releases {/* TODO: i18n */}
          </div>

          <div className="panel-controls" />
        </div>

        <div className="panel-body">
          <h3>New Can Release</h3>

          <SaleForm />

          <Components.Divider />

          {this.renderCanReleases()}
        </div>
      </div>
    );
  }
}
