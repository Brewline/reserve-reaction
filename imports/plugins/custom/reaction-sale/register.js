import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Sales",
  name: "reaction-sale",
  icon: "fa fa-beer",
  autoEnable: true,
  registry: [{
    route: "/can-release/:idOrSlug?",
    name: "sale",
    template: "saleDetail",
    workflow: "coreSalesWorkflow"
  }, {
    route: "/can-release/list",
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
    }]
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreSaleWorkflow",
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
    workflow: "coreSaleGridWorkflow",
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
