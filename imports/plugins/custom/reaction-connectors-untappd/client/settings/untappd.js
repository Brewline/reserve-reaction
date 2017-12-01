import React, { Component } from "react";
import { registerComponent } from "/imports/plugins/core/layout/lib/components";
import "./untappd.html";

class UptappdConnectorImport extends Component {
  // static propTypes = {
  //   actionViewIsOpen: PropTypes.bool,
  //   data: PropTypes.object,
  //   structure: PropTypes.object
  // }

  getAccessToken() {
    return this.props.accessToken;
  }

  fetchAccessToken() {
    Meteor.loginWithUntappd();
  }

  render() {
    if (!this.getAccessToken()) {
      return (
        <div className="panel-group">
          <button type="button" onClick={this.fetchAccessToken.bind(this)}>
            Connect with Untappd
          </button>
        </div>
      );
    }

    return (
      <div class="panel-group">
        <div class="panel-title">
          <h4>
            <span data-i18n="admin.untappdConnectSettings.headingImport">
              Search
            </span>
          </h4>
        </div>
        <div className="panel-body">
          <form>
            <input type="text" placeholder="search" />

            <button type="button" className="btn btn-default" onClick={this.searchProducts}>
              <i className="fa fa-cloud-download"></i>
              <span data-i18n="admin.untappdConnectSettings.startImport">Search</span>
            </button>
          </form>
        </div>
      </div>
    );
  }
}

registerComponent({
  name: "uptappdConnectorImport",
  component: UptappdConnectorImport
});

export default UptappdConnectorImport;