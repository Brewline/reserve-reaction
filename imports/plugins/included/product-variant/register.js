import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Products",
  name: "reaction-product-variant",
  icon: "fa fa-cubes",
  autoEnable: true,
  registry: [{
    route: "/tag/:slug?",
    name: "tag",
    template: "Products",
    workflow: "coreProductGridWorkflow"
  }, {
    route: "/products/createProduct",
    name: "createProduct",
    label: "Add Product",
    icon: "fa fa-plus",
    template: "productDetail",
    provides: ["shortcut"],
    container: "addItem",
    priority: 1,
    permissions: [{
      label: "Create Product",
      permission: "createProduct"
    }]
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreProductWorkflow",
    collection: "Products",
    theme: "default",
    enabled: true,
    structure: {
      template: "productDetail",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "productNotFound",
      dashboardHeader: "productDetailSimpleToolbar",
      dashboardControls: "productDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }, {
    layout: "coreLayout",
    workflow: "coreProductGridWorkflow",
    collection: "Products",
    theme: "default",
    enabled: true,
    structure: {
      template: "Products",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "productNotFound",
      dashboardHeader: "gridPublishControls",
      dashboardControls: "productDetailDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
