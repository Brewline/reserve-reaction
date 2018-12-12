import Reaction from "/imports/plugins/core/core/server/Reaction";

import queries from "./lib/queries";
import resolvers from "./lib/resolvers";
import schemas from "./lib/schemas";

Reaction.registerPackage({
  label: "Sales",
  name: "reaction-sale",
  icon: "fa fa-beer",
  autoEnable: true,

  graphQL: {
    resolvers,
    schemas
  },
  queries,

  registry: [{
    route: "/can-release/:idOrSlug?",
    name: "sale",
    template: "saleDetail",
    workflow: "coreSalesWorkflow"
  }, {
    route: "/can-release/:idOrSlug/:productSlug",
    name: "saleProduct",
    template: "saleProductDetail",
    workflow: "coreSalesWorkflow"
  }, {
    route: "/can-releases",
    name: "sales",
    label: "Can Releases",
    icon: "fa fa-beer",
    enabled: true,
    template: "saleDashboard",
    provides: ["settings"],
    container: "core",
    priority: 1,
    permissions: [{
      label: "Can Releases",
      permission: "createProduct" // createSale
    }],
    workflow: "coreSalesGridWorkflow"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreSalesWorkflow",
    collection: "Sales",
    theme: "default",
    enabled: true,
    structure: {
      template: "saleDetail",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "saleNotFound",
      dashboardHeader: "saleDetailSimpleToolbar",
      dashboardControls: "saleDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }, {
    layout: "coreLayout",
    workflow: "coreSalesGridWorkflow",
    collection: "Sales",
    theme: "default",
    enabled: true,
    structure: {
      template: "sales",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "saleNotFound",
      dashboardHeader: "gridPublishControls",
      dashboardControls: "saleDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
