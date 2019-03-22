# v2.0.0-rc.11

This is our eleventh **release candidate** for v2.0.0 of Reaction.
Please check it out and let us know what works and what doesn't for you.

This release is being coordinated with `reaction-platform` and is designed to work with the same versions of `reaction-next-starterkit` and `reaction-hydra`.

# Improvements

### App

Reaction is **no-longer** a customer-facing app, it's an administration tool and offers a GraphQL API.

All customer-facing views are the responsibility of a separate storefront app that makes use of the GaphQL API. See our [example storefront](https://github.com/reactioncommerce/reaction-next-starterkit) as an example of how to achieve this.

- All routes require admin authentication
- All non-admin authentication requests will be met with a logout screen if attempting to sign into the operator experience.
- All customer related authentication requests should be done with the IDP workflow. See our [example storefront](https://github.com/reactioncommerce/reaction-next-starterkit) as an example of how to achieve this.

Product grid and Product detail pages moved into the new operator experience and updated for that experience.

### Product grid

Product grid is now represented as a table in the new experience with the same bulk actions it had previously

- Product grid is now a table
- Product table supports multi-selection
- Product table supported bulk actions are "Make Hidden", "Make Visible", Archive, Duplicate and Publish
- Product table adds simple pagination controls with and items per page selector

### Product Detail Page

Is no longer a WYSIWYG editor.

All product forms have been moved on from the sidebar and into the main view and have been expanded.

- Product WYSIWYG editor has been replaced with standard forms
  - Product detail, Variant and Option forms have been moved out of the sidebar and into the primary view
- Template field has been converted to text field from a dropdown. Templates no longer apply to the PDP page in Reaction
- Tags can no longer be drag n' dropped to reorder. Drag handle has been removed to represent this.
- Media can be added to the Product, Variants, and Options
- Drag n' Drop of media and variants has been removed
  - Variants and Options can now be manually sorted by priority
  - Media can be sorted by priority manually
- Variant and Options forms now share the same fields

### User Profile

- The profile page has been moved to the new operator experience for admins
- Address form has been removed
- Order history has been removed
- Admins will be able to change their email and password

# Breaking Changes

Reaction is no-longer a customer-facing app, it's an administration tool and offers a GraphQL API.

We have removed the `search-mongo` and `ui-search` plugins from the `imports/plugins/included directory` of `reaction`. Which in turn removes `order search bar` from operator order UI. (#5053)

## Feature

- feat: remove search plugins (#5053)
- feat: allow users to disable plugins via config (#5031)
- feat: add addOrderFulfillmentGroup mutation (#5027)
- feat: add splitOrderItem mutation (#5024)
- feat: add updateOrderFulfillmentGroup mutation (#5020)
- feat: add updateOrder mutation (#5019)
- feat: add moveOrderItems mutation (#5018)
- feat: add cancelOrderItem mutation (#5010)
- feat: Operator 2.0 products admin (#5005)
- feat: performance metrics integration with calibre (#5012)
- feat: simple-pricing plugin (#5014)
- feat: use .env.example files from custom plugins (#5003)

## Fix

- fix: bin/setup handling bad env.example (#5048)
- fix: naming issue caused taxes to not be calculated (#5043)
- fix: startup asset provisioning (#5033)
- fix: make bin/setup more robust to missing directories (#5026)
- fix: item subtotal is incorrect when additional quantities of the same item are added to cart (#5021)

## Chore

- chore: add better logging of package loading (#5051)
- chore: add optional first and last name fields to schemas (#5050)

# v2.0.0-rc.10

This is our tenth **release candidate** for v2.0.0 of Reaction.
Please check it out and let us know what works and what doesn't for you.

This release is being coordinated with `reaction-platform` and is designed to work with the same versions of `reaction-next-starterkit` and `reaction-hydra`.

# Improvements

### UI Removal

We have removed several UI components to transition and solidify that in 2.0 the application will only be used as an API and a UI for shop operators.

Additional PRs will be coming to remove other pieces of the storefront UI bit by bit until only an operator UI is left. (#4947 , #4948)

### Performance Tweaks

- We have done a bunch of performance tweaks to increase performance and initial boot time! We removed the `reaction-cli` with this update. (#4992)

### General

- We have added the ability for shops to apply surcharges depending on criteria for an order. (#4829)
- We have added a new Navigation Manager UI for Operator 2.0. (#4936)
- We have added [envalid](https://www.npmjs.com/package/envalid) as a dependency for validating environment variables. (#4983)

### GraphQL

- We have streamlined the way plugins register functions that can transform media objects for a product. (#4987)
- We have implemented GraphQL subscriptions support. (#4938)

### Custom Data

- We have added the capability to add a custom data object when placing an order. (#4962)
- We have added the capability for `calculateOrderTaxes` to return a custom data object. (#4955)

### Custom Plugins

- We have coalesced the separate env.example files from custom Reaction plugins into one file to reduce tedious integration steps. (#5003)

# Breaking Changes

### AppEvents

- We have replaced all `Hooks` usage with the newer `appEvents`. This does not break anything within the core and included plugins, however:
  If you use community or custom plugins that depend on the `@reactioncommerce/hooks` package, you will need to update or obtain updated versions that use `context.appEvents` instead.
  If you have a plugin that uses `MethodHook`s, update it to implement those hooks a different way.
  review all `appEvents` consumed and emitted by custom plugins. Update expected and emitted arguments. See the table. (#4915)

### Multiple Payment Support

- All of the individual `placeOrder*` GraphQL mutations provided by the built-in payment plugins are removed and replaced with a single `placeOrder` mutation which supports multiple payments. Any custom payment method plugins will break due to the removal of `createOrder` internal mutation. Look at all changes. (#4908)

### Surcharges

- When applying surcharges to certain methods, there is a delay in the update. (#4984)

### Updates

- Refactor`inventoryQuantity` to `inventoryInStock` in `Products` collection, update if used in your codebase. (#4930)

### Removals

- There is no longer a storefront catalog grid (#4973)
- There is no longer a Checkout UI (#4948)
- There is no longer a Cart UI (#4948)

# New Commands

In relation to improving performance, we have added new debugging statements (#4992)!

```
"inspect": "node --experimental-modules --inspect ./.reaction/run/index.mjs",
"inspect-brk": "node --experimental-modules --inspect-brk ./.reaction/run/index.mjs",
"inspect-docker": "node --experimental-modules --inspect=0.0.0.0:9229 ./.reaction/run/index.mjs",
"inspect-brk-docker": "node --experimental-modules --inspect-brk=0.0.0.0:9229 ./.reaction/run/index.mjs",
```

**Example Usage** :

```
docker-compose run --rm --service-ports reaction yarn run inspect-brk --service-ports
docker-compose run --rm --service-ports reaction yarn run inspect --service-ports
```

# New Documents

We have added new documentation! :

- We officially stated that `reaction-platform` has not been fully tested or is compatible with Windows.
  https://docs.reactioncommerce.com/docs/next/installation-reaction-platform
- We added a Storefront UI Development guide answering: "How do I build a storefront for Reaction or adapt my storefront to get its data from Reaction, without starting from an example app" (https://docs.reactioncommerce.com/docs/next/storefront-intro)

## Feature

- feat: use .env.example files from custom plugins (#5003)
- feat: add ordersByAccountId query (#4981)
- feat: allow plugins to register functions to handle GraphQL transformation of catalog product media items (#4988)
- feat: support storing custom fields on orders when placing (#4962)
- feat: shipping Operator into 2.0 (#4967)
- feat: custom tax data part 2 (#4965)
- feat: allow tax services to add custom data to taxes (#4955)
- feat: shipping surcharges (#4829)
- feat: navigation manager UI (#4936)
- feat: make Sitemap data available via GraphQL query (#4927)
- feat: tag management operator UI (#4914)
- feat: add custom fields to order schema (#4979)
- feat: update collectionIndex util function to take options (#4950)
- feat: add envalid package (#4943)
- feat: GraphQL subscriptions (#4938)
- feat: create fulfillment surcharges (#4801)

## Fixes

- fix: add tagId check to guard against undefined (#5015)
- fix: do not emit afterCartUpdate unless surcharges are updated (#5001)
- fix: properly save all customFields from tax service result (#4986)
- fix: don't crash when mediaItem.URLs is null (#4982)
- fix: addAccountAddressBookEntry mutation - set account updatedAt (#4971)
- fix: taxes not updating reactively in starterkit (#4949)
- fix: inventory is set to `NaN` in rare circumstances based on Migrations (#4946)
- fix: use stripe.setAppInfo to identify ReactionCommerce to Stripe (#4942)
- fix: tag bulk actions copy (#4941)
- fix: ENOSPC error with jest --watch (#4939)
- fix: tag ui bugs (#4933)
- fix: migration 56 throwing an error (#4934)
- fix: 404 from invite email link (#4919)

## Refactor

- refactor: update `inventoryQuantity` field to be `inventoryInStock` (#4930)
- refactor: replace all Hooks with appEvents (#4915)
- refactor: rewrite placeOrder and support multiple payments for an order (#4908)

## Chores

- chore: delete unused files (#4990)
- chore: wrong version in migration 54 & 55 file (#4940)
- chore: updated dependencies and snyk policies (#4974)
- chore: meteor and docker performance tweaks (#4992)
- chore: storefront catalog grid (#4973)
- chore: remove the cart UI (#4948)
- chore: remove the checkout UI (#4947)
- chore: update to base image 1.8.0.2 to include Kafka binary libs (#4937)

## Contributors

Thanks, @rattrayalex-stripe for contributing to this release!

# v2.0.0-rc.9

This is our ninth **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

This release is being coordinated with `reaction-platform` and is designed to work with the same versions of `reaction-next-starterkit` and `reaction-hydra`

## Inventory improvements

We've made some updates to the way inventory is tracked, introducing a new inventory field: `inventoryAvailableToSell`. This field tracks inventory that has been ordered, but has not yet been processed and so is still counted in-stock. This number is what is displayed to customers and determines whether a product is considered "sold out" or not. The old inventory number `inventoryQty` has been renamed to `inventoryInStock` and continues to represent the inventory available in stock. For more info see #4859.

## Breaking changes

### Inventory

- Migration 51 has been added to attach `inventoryAvailableToSell` to all products / variants, to correctly calculate the numbers on parent products / variants, and to publish this data to already published Catalog items.
- `currentQuantity` has been marked with `depreciated` in the cart. This isn't a breaking change at the moment, but lays the path to remove this field and replace with `inventoryAvailableToSell` and `inventoryInStock` in the future.
- `Catalog.getVariantQuantity` and `ReactionProduct.getVariantQuantity` have been removed. Custom plugins using these methods will need to be updated. The same data returned by these methods is now on the object that was being passed into these methods as the field `inventoryQuantity` or `inventoryAvailableToSell`
- Moved `isBackorder`, `isLowQuantity`, and `isSoldOut` functions from the `catalog` plugin to the new `inventory` plugin. Custom plugins using these methods will need to update their import path.

## Features

- feat: Add flag to enable only IDP routes (#4903)
- feat: Record plugin versions in DB and show in Shop panel (#4895)
- feat: Add support for fallback tax service (#4871)
- feat: Update to Apollo Server 2.0 (#4884)
- feat(#4848): Return only isVisible Tags, unless admin (#4879)
- feat: Support remote graphql schemas in plugins (#4870)
- feat: Support plugins directly registering React components (#4875)

## Bugfixes

- fix: Password reset page not found (#4917)
- fix: add replace to remove comma from formatting (#4910)
- fix: add contentForLanguage resolver for nav item content (#4913)
- fix: Restore CORS for 401s (#4894)
- fix: Meteor method permissions fixes (#4883)
- fix: Multi-shop permission fixes (#4872)
- fix: check permissions for order workflow methods (#4863)

## Tests

- test: Fix sitemaps test timeouts (#4920)

## Refactors

- refactor: updates to inventory counts and statuses (#4859)

# v2.0.0-rc.8

This is our eighth **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

## New Bits

### Operator 2.0

The core experience and UI for a shop operator using Reaction Commerce has not changed much over the last couple of years. We've been hard at work on the new and improved [storefront](https://github.com/reactioncommerce/reaction-next-starterkit) but until now have not revealed any of our design or plans for improving the updated operator UI.

This release includes the first beta of the new Reaction operator UI. Our focus with this new operator UI has several goals. First, we’re transitioning from a single page storefront and admin experience to a full page admin experience that will be separate from the storefront. . We believe this change is necessary and beneficial for anyone operating a store that works with a large number of products and/or does a high-volume of order. This change also decouples the customer facing storefront from the operator UI. The existing UI had a WYSIWYG flavor to it where the product and catalog management was done in an interface that was identical to what the customer saw. There are some benefits to this - having a good perspective of what your customers see when you make a change - but for large catalogs, it's not very practical. In addition, we’ve received feedback that the experience could be confusing for admin users who wanted to concentrate on their admin tasks only. Once decoupled the operator UI can use 100% of the screen space for store management and operation. The change will be a big benefit to users managing large product catalogs and complex fulfillment patterns.

Right now this new operator UI is opt-in and the existing, drawer style operator experience will continue to function as it has. You can access the new operator UI by visiting `/operator`.

<img width="1245" alt="operator_2 0" src="https://user-images.githubusercontent.com/486340/48387165-7a44f080-e6a9-11e8-8977-75893be34ee2.png">

This UI should have all existing functionality baked in, but we anticipate that there may be some rough edges and from a user experience standpoint it is the first step on a longer path. The first step here has been to replicate existing functionality by moving existing components into the new layout and fixing bugs that we've found. Going forward, we'll be implementing improved UIs for many of the operator tools - Catalog Management, Inventory, Pricing, Order Management, etc.

Please file an issue for any bugs that you find, whether they be weird UI quirks or things that don't as expected.

### .env file

Most services that make up the Reaction platform use a .env file in the root of the service folder to define environment variables that should be set while running. They also have a pre-build script that the reaction-platform tool runs to create or update the .env file from a .env.example file, which is committed. Until now, this project did not use `.env` file, so we've added one. See https://github.com/reactioncommerce/reaction/pull/4826 for more details.

## Improved Bits

### Support for extending GraphQL enums and unions

We've updated GraphQL and GraphQL Tools to new versions and added support for `extend enum` and `extend union`. This permits extending the core schema in this way from a plugin. See https://github.com/reactioncommerce/reaction/pull/4798 for more details

### Developer performance

When we introduced `reaction-platform` and begun developing in Docker environments, we began to notice high CPU utilization that for those of us developing on OSX.

<img width="1143" alt="image" src="https://user-images.githubusercontent.com/1203639/51052875-dc787f80-158c-11e9-9f16-60f81e43b4ec.png">

Long story short, this is an [issue with filesystem operations in Docker for Mac](https://github.com/docker/for-mac/issues/1759#issue-237416539) and there's not much we can do to resolve the core issue. In development mode, we leverage Meteor to watch for file changes. By adjusting the polling interval for the Meteor file watcher, we can greatly reduce the issues introduced by Docker for Mac. We've set two environment variables in the example .env file `.env.example` (https://github.com/reactioncommerce/reaction/pull/4826) as follows, but if these don't work for you, I'd start by adjusting the polling interval to something higher - 20000 (20s) or 30000 (30s). If you're working directly on the core `reaction` project, this may impact how long it takes before a change you've made is recognized and rebuilt, but that may be a small price to pay to reduce CPU burn by hyperkit. There shouldn't be any other consequences to increasing this number.

```
  METEOR_DISABLE_OPTIMISTIC_CACHING=1
  METEOR_WATCH_POLLING_INTERVAL_MS=10000
```

## Breaking changes

This release contains a number of breaking changes that we've been working to get into Reaction before we cut the final 2.0.0 release. If you're planning to update an existing shop, please read through this list

### Catalog

- Added a new, final param to xformVariant with the processed inventory flags (https://github.com/reactioncommerce/reaction/pull/4742)

### Meteor Methods

- Payment plugins that use Meteor methods for capture and refund will not be compatible with this PR. This is intentional as we're migrating toward GraphQL and away from Meteor Methods for client-server interaction. Custom payment methods will need to be rewritten to follow the pattern in #4803. (https://github.com/reactioncommerce/reaction/pull/4803)
- If a custom plugin uses any of these methods, it will need to be updated. (https://github.com/reactioncommerce/reaction/pull/4815)
  - `shop/getBaseLanguage`
  - `shop/getCurrencyRates`
  - `shop/getWorkflow`
  - `getTemplateByName`
  - `orders/addOrderEmail`
  - `taxes/updateTaxCode`
  - `workflow/coreOrderWorkflow/coreOrderProcessing`
  - `workflow/coreOrderWorkflow/coreOrderCompleted`
- Custom code relying on being able to call the "accounts/sendWelcomeEmail" Meteor method will break. Calls from client code must be removed. Calls from server code should be updated to import and call the util function. (https://github.com/reactioncommerce/reaction/pull/4867)

### Taxes

- We've created a new `taxes-rates` plugin in the `included` folder, and all features related to custom rates have been moved there. This includes the "Custom Rates" panel in tax settings; the `Taxes` collection and its related schemas; the "taxes/addRate", "taxes/editRate", and "taxes/deleteRate" Meteor methods, and the "Taxes" Meteor publication.
- The core `taxes` plugin has a new API for registering tax services (such as the included "Custom Rates" service, or a custom Avalara service for example). They are registered by passing in a `taxServices` array to `registerPackage` (example and details in #4785)
- Some tax-related fields on Cart, CartItem, Order, OrderFulfillmentGroup, and OrderItem have been moved, renamed, added, or removed. We've attempted to remove all unused fields, and group or rename other fields for clarity. One example is the `taxes` array, which now has a different schema and appears for individual items as well as the full cart or order fulfillment group.
- On `Products` documents, `taxable` is now `isTaxable`. This change had previously been made in the `Catalog` schema and now is made in `Products` to match.
- For the Custom Rates plugin, be aware that the `taxCode` value is now used for filtering which products should be taxed at that rate. This requires a review of all your products to ensure that they have a tax code specified, in addition to being marked as taxable. If you'd rather not do this review, you can revert to the old behavior of ignoring tax codes by editing each of your Custom Rates entries, clearing the the "Tax Code" field, and saving.
- _If you are upgrading from 1.x and use only Custom Rates for taxes, data migrations should provide a seamless transition. Most tax changes are breaking only for third-party non-included tax plugins. However, please verify after upgrading that the correct tax service is active._

### Address Validation

Breaking changes to how address validation works. Affects all plugins that provide address validation and all clients that validate addresses. (https://github.com/reactioncommerce/reaction/pull/4767)

### Configuration

- Propel was updated and any propel scripts must be updated. (https://github.com/reactioncommerce/reaction/pull/4802)
- If you run Reaction locally, such as for development, you will now need to be sure there is a `.env` file with correct environment variables set in it. The `.env.example` file, with no changes, should work for most people. When running with reaction-platform, this should happen automatically. But if you've already been developing locally and you pull in this change, you'll need to run bin/setup once. You can also run bin/setup anytime you pull in the future, to add any new ENV variables. (https://github.com/reactioncommerce/reaction/pull/4826)
- Docker network streams.reaction.localhost must be created, which developers can do by pulling down the latest reaction-platform and running make (or make network-create if they want to be surgical about it). (https://github.com/reactioncommerce/reaction/pull/4805)

### Meteor Plugins

- Custom plugins that rely on the dispatch:run-as-user Meteor package will need to find a different solution and remove the dependent code. (https://github.com/reactioncommerce/reaction/pull/4825)

## Features

- feat: Navigation Backend (#4683)
- feat: shipping method restrictions (#4821)
- feat: Update main Reaction app to use `.env` file (#4826)
- feat(tag): add Display Title to Tag (#4856)
- feat: Operator 2.0 first draft (#4800)
- feat: Deploy feature branches to ECS (#4834)
- feat: Add Order.referenceId (#4827)
- feat: Use no-meteor functions for payment capture and refund methods (#4803)
- feat: Remove unused meteor methods (#4815)
- feat: Put mongo on the streams network (#4805)
- feat: Update graphql packages to support extend enum and extend union (#4798)
- feat: Improve tax API, split out Custom Rates plugin (#4785)
- feat: Address validation GraphQL (#4767)
- feat: add isBackorder data to variants (#4855)

## Fixes

- fix: Migrate existing tag nav to new navigation tree structure (#4882)
- fix: primaryShopId query fallback (#4862)
- fix: permission issues with Meteor methods for Accounts plugin (#4867)
- fix: Add migration file for plugin route name change (#4858)
- fix: CartCleanupJob (#4799)
- fix: 404 on Hydra Oauth page (#4835)
- fix: Jest integration tests (#4824)
- fix: ECS deployments (#4836)
- fix: ECS deployment: move TLS certificate ARN from propel.yaml to ENV vars (#4802)
- fix: catalog variant inventory flags always false (#4742) .. Resolves #4741
- fix: tax calculation arguments, other tax fixes (#4811)

## Refactor

- refactor: shipping rules (#4789)

## Performance

- perf: Add a mongodb index on Catalog.updatedAt (#4819)

## Chores

- chore: use ci env var for staging url (#4885)
- chore: e2e integration for release branches (#4878)
- chore: Configure prettier arrowParens to match our eslint rules (#4876)
- chore: Add node_modules/.bin to PATH in docker (#4820)
- chore: remove unused dispatch:run-as-user package (#4825)

# v2.0.0-rc.7

This is our seventh **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

## Security Release

This security release addresses to potential vulnerabilities

1. We discovered a vulnerability that affects shops built on Reaction Commerce that use the Reaction-Social plugin with Facebook and the Facebook App Secret configured. More details on this issue below.

2. Remove dependency on `event-stream`

## Event Stream Dependency Removal

This fix removes a dependency on `event-stream` introduced by `nodemon` via `pstree` by bumping `nodemon` and `pstree.remy` through `nodemon` to a version that does not include `pstree`.

[event-stream](https://github.com/dominictarr/event-stream/issues/116) had a malicious bit of code added to version `3.3.6` which has since been removed from github and appears to have specifically targeted [copay](https://github.com/bitpay/copay/issues/9346).

# v2.0.0-rc.6

This is our sixth **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

## Meteor 1.8 Final

We've been using a release candidate of Meteor 1.8 in all of our 2.0 release candidates to this point - this has also included release candidate versions of Babel 7. In this release we're updating to the final version of Meteor 1.8 and Babel 7.

There are a lot of great updates that are included in Meteor 1.8 and you can read all about them in the [Meteor blog](https://blog.meteor.com/meteor-1-8-erases-the-debts-of-1-7-77af4c931fe3). I think the one that we'll notice the most is significant improvement to build performance that. We've been focused on improving the performance and developer experience with Reaction for a while now and this update makes significant progress towards improving the developer experience and build times. Anyone who's been using Reaction for a while should notice big improvements to the amount of time it takes for the app to rebuild after making changes.

We're still working with Node.js 8.11.4 as the upgrade to Node 8.12.0 got postponed to the Meteor 1.8.1 release. If you're itching to play with it, you can run `meteor update --release 1.8.1-beta.n` from the directory that you've got the core `reaction` project installed. There may be some additional speed improvements related to Meteor's use of `Fiber`s that come along in this version.

We've also updated the our base docker image to use Meteor 1.8 (#4760)

## Email Sending

We've extracted the core email sending functionality into a new `reaction-email-smtp` plugin which is `included` and created a new `sendEmail` event which is emitted for each email job. The core smtp email plugin now listens for these events and sends an email if an SMTP provider is configured. By doing this we've made it possible to create plugins which send emails via an API rather than via SMTP.

The email provider config form found at Dashboard -> Emails -> Mail Provider is now also able to be overridden. Plugins can use register.js to provide a React component to use here.

## GraphQL API

Added a primaryShop GraphQL query & resolver, eliminating the need to first query for the primary shop ID, followed by another query for shop by ID.

## Breaking Changes

In #4749 we changed the names of our included payment method plugins. We've included a migration to automatically update any existing installation, but if you have custom code that relies on these payment method names you may need make some changes.

## Fixes

- fix: keep toggles shown, width 100% in action view (#4772)
- fix: Use babel.config.js to fix Jest tests in custom plugins with package.json (#4782)

## Features

- feat: decouple SMTP email sending logic from core to allow plugins to override (#4740)
- feat: Add a CORS-enabled endpoint for token refresh in Hydra plugin (#4743)
- feat: GraphQL query & resolver for loading the primary shop (#4747)
- feat: update to Meteor 1.8 final (#4753)
- feat: update to base image 1.8 (#4760)
- feat: client ui payment methods (#4749) .. Resolves #4719
- feat: added migration for adding available payment methods to shops. (#4729)
- feat: use GraphQL for payment methods operator ui (#4749) .. Resolves #4719

## Migrations

- chore: added migration for adding available payment methods to shops. (#4729)

## Chores

We've been ignoring some of our integration tests as the in-memory MongoDB they rely on has not been working effectively. Previously we did this by skipping our entire `test:integration` tests in CI, we're now just skipping the tests that are failing due to this db incompatibility and have plans to address this soon.

- chore: Skip failing integration tests (#4751)
- chore: Deploy release branches to staging ECS environment (#4758)

# v2.0.0-rc.5

This is our fifth **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

## Mongo replica set issue

Many people were having issues with the Mongo replica-set image starting before the Mongo database was ready. This could cause the replica-set to fail and the application to hang during startup in a development environment. This is fixed in #4748 by waiting for mongo to be reachable within the reaction container before connecting to it, and creating the DB if needed, initiating the replica set if needed, and waiting for the replica set to be OK. This fix should solve the docker-compose startup race conditions we've been seeing. (#4748)

## GraphQL

We've added two new GraphQL queries for payment methods. A query `paymentMethods` which will list all registered payment methods and is restricted to operators and `availablePaymentMethods` which will list all payment methods which have been enabled. These new queries were added in #4709. We've also added a GraphQL mutation that permits an operator to enable or disable a payment method for a shop in #4739

We've updated the CartItems and OrderItems GraphQL queries to include a `productTags` resolver which will return the tags for the CartItem or OrderItem. The new resolvers and updated schemas were added in #4715 and #4732

There is a new GraphQL mutation for generating sitemaps `generateSitemaps` this replaces the `sitemaps/generate` meteor method. method. (#4708)

## Classic Storefront UI Updates

We've replaced the customer facing Product Grid in the Classic Storefront UI with our [CatalogGrid](https://designsystem.reactioncommerce.com/#!/CatalogGrid) component from the Reaction Design System. This was accomplished in #4649

There's a new "Include in sitemap?" checkbox in the Product Settings when using the operator interface to edit product information. This was added to make it possible to exclude published products from the sitemap. (#4708)

## Additional Plugin Capabilities

A plugin can now include a `catalog` object in `registerPackage`, with `customPublishedProductFields` and `customPublishedProductVariantFields` that are set to arrays of property names. These will be appended to the core list of fields for which published status should be tracked. This is used to build the hashes that are used to display an indicator when changes need to be published. (#4738)

A plugin can now use the `functionsByType` pattern to register one or more functions of type "publishProductToCatalog", which are called with `(catalogProduct, { context, product, shop, variants })` and expected to mutate `catalogProduct` if necessary. (#4738)

## nvmrc

Even though most of the development work happens in Docker, getting the right version of node available directly in the host OS is convenient for setting up eslint integration with your editor. We've added an `.nvmrc` file for this as [we've recommended](https://docs.reactioncommerce.com/docs/recommended-tools#general) `nvm` for installing and managing NodeJS in our docs for some time now.

## Public API Changes

We've changed the GraphQL schema for `PaymentMethod@name` from `PaymentMethodName` to `String`. `PaymentMethodName` was a subset of string and this should not cause any issues.

## Breaking Changes

WE've replaced the `generateSitemaps` Meteor method with a GraphQL mutation. See #4708 for details.

Because we've replaced the customer facing Product Grid UI in the Classic Storefront UI, if you had any plugins which relied on specific selectors or the structure of the existing UI, those may need to be updated.

## Features

- feat: payment methods (#4709) .. Resolves #4574
- feat: enable payment method for shop (#4739) .. Resolves #4718
- feat: use component library's CatalogGrid - 2.0 (#4649)
- feat: add product tags to cart items (#4715)
- feat: Add product tags to order item (#4732)
- feat: option to choose whether a product should appear in the sitemap (#4708)
- feat: add a way to extend catalog product publication (#4738)

## Fixes

- fix: Auth Consent scopes issue (#4733)
- fix: 4722 compareAtPrice - convert from Float to Money (#4731)
- fix(startup): init mongo replica set after waiting for connection (#4748)

## Chores

- chore: add .nvmrc configuration file (#4744)

## Docs

- docs: Link readers to Reaction Platform install instructions (#4724)
- docs: fix jsdoc copypasta on waitForReplica checkWaitRetry (#4723)

# v2.0.0-rc.4

This is our fourth **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

## Improving Jest test performance in CI

We started seeing unit tests timing out in CI in the morning on Friday October 5. It doesn't appear that this was caused by a change in our `jest` version as we were able to reproduce the issues on older branches which were previously passing.
This is resolved in #4176 by changing our `test:unit` script in `package.json` to run jest with the `--maxWorkers=4` flag. This resolved our issue with tests timing out, and improves test performance in CI overall. This is suggested in the troubleshooting jest here: https://jestjs.io/docs/en/troubleshooting.html#tests-are-extremely-slow-on-docker-and-or-continuous-integration-ci-server

## Checkout Totals

There were some cases in the Classic Storefront UI where there would be a discrepancy between the total calculated on the server and the price calculated by the client.
This is not an issue in the [Next.js Storefront](https://github.com/reactioncommerce/reaction-next-starterkit) as all price values are calculated on the server. This is resolved in #4701

## Bugfixes

fix: round total when verifying it on order create (#4701) .. Resolves #4684

## Chores

fix: limit jest maxWorkers to 4 to improve CI perf (#4716)

# v2.0.0-rc.3

This is our third **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

A few files snuck into our last release that had incorrect jsdoc syntax in the form of `@return <Promise>Type`
The jsdoc parser is unable to parse any return type starting with a `<` and throws an error. This error is thrown during the Deploy Docs CI step and causes that step of the CI to fail. This is resolved in #4704 by fixing the jsdoc to use the correct Promise syntax `@return Promise<Type>`

## Bugfixes

- fix: resolve errors in jsdoc Promise returns (#4704)

# v2.0.0-rc.2

This is our second **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

### OAuth Flow

- Get the auth URL connected to the Login request from Hydra. Get the loginAction field and pass it in the UI route query param (?action={loginAction}) to serve as state info to the Login component.(#4651)
- Update the Auth components to show appropriate form fields based on route query param (e.g ?action=signin)(#4651)
- Update the SignIn and SignUp core components to have a new hasSwitchLinks prop. This will determine if link to toggle between SignIn and SignUp views should be displayed. It defaults to true (so previous behaviour is kept - no breaking change)(#4651)
- Update Auth container for OAuth IDP flow with hasSwitchLinks=false. This makes the state of the form depend on ONLY the route query (#4651)
- Fix the Hydra session feature. Now, when a user who already signed in (and is sill within the set HYDRA_SESSION_LIFESPAN), tries to login again, we won't show the login form again.(#4651)
- Add /logout endpoint for Consumer apps (like Starterkit) to call to delete user sessions from Hydra. The delete session endpoint in Hydra lives on the Administrative port (4445), so we are not exposing it to Consumer apps to consume directly.(#4651)

## Taxes

If item.tax did not exist the getTaxTotal was returning NaN which would show up in cart totals. This was introduced in #4664 and is resolved in #4670

## Operator UI for editing product information

On the PDP, when typing a tag name in the admin sidebar, a console error would appear: `Uncaught (in promise) TypeError: Cannot read property 'getShopId' of undefined at getShopLang (helpers.js:118)`. This was because `Reaction` was undefined when `getShopLang()` would run. This is resolved in #4673

## Fixes

- (fix) Properly return 0 when no tax items are present (#4670)
- fix: Show correct form state during create account oauth flow (#4651)
- Fix: console error when typing a tag name on PDP (#4673)
- fix: discounts and profile orders in 2.0 (#4674)
- fix: orders dashboard layout issue (#4688)
  Updated a few panel styles to fit within the viewport better and not end up behind the "modal overlay"

## Chores

- chore: updating get in touch link (#4676)
- chore: fix broken link in README to schema docs (#4672)

# v2.0.0-rc.1

This is our first **release candidate** for v2.0.0 of Reaction. Please check it out and let us know what works and what doesn't for you.

In many ways this may better mark the beginning of a new way to develop for Reaction rather than the end of a big development cycle. Make no mistake, there are some pretty great things that v2.0.0 includes - for example, our GraphQL API now covers the basic commerce flow, from browsing a catalog all the way through checkout. However, this release is also bigger in many ways that just this repository. Much of our work over the past several months has gone into repositories other than this primary `/reaction` one.

We've created a component library called the [Reaction Design System](https://github.com/reactioncommerce/reaction-component-library) which we're announcing the initial "alpha" for. While it's still subject to change, there are a lot of very useful commerce focused components that we've built that live there. We'll have a link to the styleguidist playground up soon where you can play with and read the docs for each component.

Our new GraphQL API has enabled us to build a new UI Client for Reaction that we're calling our [NextJS Starter Kit](https://github.com/reactioncommerce/reaction-next-starterkit). This new UI client provides a reference storefront implementation that communicates with the Reaction API exclusively via GraphQL, eliminating some of the sluggishness that was associated with our Classic UI built on Meteor. This new client is built with NextJS and provides Server Side Rendering (SSR) out of the box, as well as (Segment compatible analytics event tracking)[https://segment.com/docs/spec/ecommerce/v2/]. We'll recommend this as the best way to build a storefront UI for Reaction going forward.

We're also introducing a new OpenID Connect OAuth2 Service which uses [Hydra](https://github.com/ory/hydra) to enable our new UI Client to leverage our existing Meteor based Identities and roles.

These services all run together to form the Reaction Platform (working title, subject to change) - and we've got a new project called [Reaction Platform](https://github.com/reactioncommerce/reaction-platform) which will help you get everything connected and launched together.

This changelog may feel somewhat insignificant because in part, we've been releasing bits of what is becoming 2.0.0 over the last several releases and much of the new development is happening outside of the `/reaction` repository.

## Marketplace Updates

When multiple shops match the searched domain, prioritize the Primary Shop. This is important when searching for "shop settings" which are only stored on the Primary Shop (e.g., smtp settings).

## Breaking Changes

From #4622

- Orders-related GraphQL schemas and significant changes to the Orders MongoDB schemas to better match GraphQL. See the diffs for the schema files. Two changes of note are that order.items and order.billing arrays no longer exist. Instead, each item in order.shipping has an items array and a single payment object on it. The payment object is also flattened and unused properties have been removed from it.
- context.queries and context.mutations are no longer namespaced. This simplifies things and makes it possible for one plugin to overwrite another plugin's functions if necessary.

- Some Meteor methods are removed:

  - cart/copyCartToOrder (replaced by createOrder mutation)
  - cart/submitPayment (replaced by createOrder mutation)
  - discounts/transaction
  - discounts/calculate
  - discounts/codes/credit (replaced by a function registered with the same name using functionsByType)
  - discounts/codes/discount (replaced by a function registered with the same name using functionsByType)
  - discounts/codes/sale (replaced by a function registered with the same name using functionsByType)
  - discounts/codes/shipping (replaced by a function registered with the same name using functionsByType)
  - shipping/updateShipmentQuotes
  - shipping/provider/toggle
  - shipping/rates/add (replaced with createFlatRateFulfillmentMethod GraphQL mutation)
  - shipping/rates/update (replaced with updateFlatRateFulfillmentMethod GraphQL mutation)
  - shipping/rates/delete (replaced with deleteFlatRateFulfillmentMethod GraphQL mutation)
  - taxes/calculate (replaced by non-Meteor getFulfillmentGroupItemsWithTaxAdded)
  - taxes/setRateByShopAndItem (replaced by non-Meteor getFulfillmentGroupItemsWithTaxAdded)
  - notification/send (replaced by non-Meteor createNotification function)
  - notification/delete (was unused)
  - stripe/payment/createCharges (replaced by placeOrderWithStripeCardPayment and placeMarketplaceOrderWithStripeCardPayment GraphQL mutations)

- shipping/updateParcelSize Meteor method is renamed to shop/updateDefaultParcelSize and moved to core/shop service
- Meteor UI client checkout code now places orders using GraphQL
- Add orderById GraphQL query
- The "afterCartUpdate" hooks are now called with just (updatedCart) rather than the redundant (updatedCartId, updatedCart)
- The way that orders are placed is now different. See "Order Changes" heading
- Orders can no longer be created without an email address
- The process by which plugins are asked to provide available fulfillment methods + quotes for them is changed. Rather than calling registered hooks, it calls all functions registered with the name "getFulfillmentMethodsWithQuotes" (See getFulfillmentMethodsWithQuotes.js)
- The "example" payment method form is now an "IOU" form that collects only a full name. It previously had a fake credit card form, which might have been misleading. Now it is clear that it's for demo and trial purposes only. Also, this new form is in React.
- Some unused (by core) functions have been removed from the cartOrder.js transforms that are available on Cart and Order documents in Meteor.

Previously client code would tell the server to "copy cart to order". Now, the orders plugin is mostly unaware of what a cart is. The client is responsible for converting a cart (which is a work-in-progress order) into the OrderInput schema and placing an order using that.

Related to this, payment information is now never stored on the cart. It is collected during checkout and sent with the placeOrder call. An order will only be placed if charges are successfully created using the provided payment details.

The orders service is largely unaware of how payment is done, and there is no generic placeOrder mutation. Instead, plugins that provide payment methods are expected to provide GraphQL mutations that allow you to place and pay for an order using that method. Most of the logic is shared, and is encapsulated in a createOrder mutation that the orders plugin provides. But each payment method plugin wraps the createOrder mutation to handle payment specifics.

All Meteor UI checkout code is updated to place orders using the new GraphQL mutations. The Meteor methods formerly involved in placing orders and payments are removed.

There are currently three included payment methods, each with their own place order mutation:

    placeOrderWithExampleIOUPayment
    placeOrderWithStripeCardPayment
    placeMarketplaceOrderWithStripeCardPayment

For production, use placeOrderWithStripeCardPayment. placeOrderWithExampleIOUPayment is included for demo purposes and does not require any external services. placeMarketplaceOrderWithStripeCardPayment is part of the "marketplace" plugin, which is not fully implemented or supported. Each payment method has its own checkout UI component, which collects whatever information it needs securely.

We've updated the password reset flow to use a full page in #4637

- Move previous Password Reset modal to a dedicated page on /reset-password/:token
- Rename the affect components to not have modal suffixes
- Show a message on successful reset of the password (previously, the modal closes)

In #4613 we've renamed the Docker network on which GraphQL enabled web services are attached to `api.reaction.localhost` Networks in the Docker environment should be named as \*.reaction.localhost. The localhost TLD is reserved and guaranteed to not conflict with a real TLD.

- To enable network communication, projects communicating with Reaction's GraphQL server must be on the api.reaction.localhost Docker network.
- PRs related to reactioncommerce/reaction#4447 should be coordinated.

We've [moved the SMS schema](https://github.com/reaction-contrib/meteor-notifications-sms) to the SMS package in contrib in #4566

## Features

- feat: Prioritize Primary when multiple Shops match domain (#3528)
- feat: Setup IDP flows for Hydra auth (#4627)
- feat: Update GQL server to use Hydra Auth token (#4626)
- feat: Use new CLI tool "propel" to deploy services to ECS (#4623)
- feat(GraphQL): Place orders using GraphQL (#4622)
- feat(GraphQL): Add GraphQL via plugin, reorg files into final 2.0 plugin patterns (#4622)
- feat: 2.0 migrations (#4648)
- feat(GraphQL): add `Account.primaryEmailAddress` resolver (#4647)
- feat: Update Reset Password modal to a full page route (#4637)

## Fixes

- fix: apply requested sort to Cart.items in GraphQL resolver (#4624)
- fix: cart item attributes (#4607)
- fix: startup error before primary shop is created on initial startup (#4602)
- fix: Update detailView when its data changes (#4659)
- fix: fix README broken links, update copy (#4632)
- fix: sidebar actions not opening on product grid (#4641)
- fix: Ensure MongoDB replica set is ready before start (#4636)
-

## Chores

- chore: Rename the reaction-api Docker network (#4613)

## Refactors

- refactor: Remove unused schemas (#4566)
- refactor: remove all grid positions code and UI (#4628)

# v1.17.1

## Security Release

This security release addresses to potential vulnerabilities

1. We discovered a vulnerability that affects shops built on Reaction Commerce that use the Reaction-Social plugin with Facebook and the Facebook App Secret configured. More details on this issue below.

2. Remove dependency on `event-stream`

## Event Stream Dependency Removal

This fix removes a dependency on `event-stream` introduced by `nodemon` via `pstree` by bumping `nodemon` and `pstree.remy` through `nodemon` to a version that does not include `pstree`.

[event-stream](https://github.com/dominictarr/event-stream/issues/116) had a malicious bit of code added to version `3.3.6` which has since been removed from github and appears to have specifically targeted [copay](https://github.com/bitpay/copay/issues/9346).

# v1.17.0

This release contains mostly bug fixes, many of which are focused on Marketplace implementations. Thanks to @pmn4 for contributing many of the marketplace fixes and additions.

There's also a little bit of cleanup of unused code in this release. This will likely be our last release on the 1.x line as our new work is focused on our 2.x version.

## Features

- feat: Prioritize Primary when multiple Shops match domain (#3528)

## Fixes

- fix: custom tax rates not applied (#4806)
- fix: console error tag name error pdp .. Resolves #4776 (#4790)
- fix: email settings update on cancel (#4792)
- fix: update detailView when its data changes (#4791)
- fix: submitting the template edit form now works .. Resolves #4774 (#4780)
- fix: edit groups panel (#4771)
- fix: add translated text for adding user to group by admin (#4562)
- fix: Hide Action View if Product Settings panel open (#4433)
- fix: Import `getSlug` instead of using `this.getSlug` (#4547)
- fix: Product Visibility for Marketplace Shops (#4425)
- fix: cart item attributes (#4607)
- fix: startup error before primary shop is created on initial startup (#4602)
- fix: avoid infinite looping when taxes are enabled (11e95ba) .. Resolves #4620
- fix: limit jest maxWorkers to 4 to improve CI perf (cd76a50)

## Refactors

- refactor: Remove unused schemas (#4566)

## Chores

- chore: Rename the reaction-api Docker network (#4613)
- chore: Use new CLI tool "propel" to deploy services to ECS (#4623)

# v1.16.0

## GraphQL

### Features

- feat: return absolute media URLs from GraphQL (#4565)

## Meteor App

### Features

- feat 4571 Replace all Meteor.userId() with util function (#4582)
- feat: Improve animations and dynamically import animation libraries to reduce bundle size (#4500) .. Resolves #4441

### Fixes

- fix: reaction error swallowing (#4592)
- fix: update file-collections dependency from 0.5.0 to 0.6.0 (#4589)
- fix: null check in email validation (#4520) .. Resolves #4502
- fix: Add missing Shops.layout migration (#4609) .. Resolves #4608

# v1.15.0

## Sitemap Generator

A sitemap generator plugin that creates and stores XML for a sitemap index, as well as sitemaps for tag pages, PDPs, and arbitrary URLs that can be added via an event hook.

There is a recurring job that runs every 24 hours (the specific interval can be changed) that generates the sitemaps. There is also a button to manually trigger a refresh, at Dashboard -> Shop -> Options - along with a notification that appears when it's completed.

## Use our GraphQL API for the Product Grid within the Meteor App

As part of our push towards our GraphQL API, we've started to leverage the API inside of our existing Meteor app. This release converts our customer facing product grid from using Meteor Pub/Sub to consuming data from our GraphQL API instead. This is the first step in an ongoing initiative to start using the GraphQL API inside of our existing monolithic commerce application. See #4481 for a list of files changed.

## GraphQL Checkout

This release includes the first set of GraphQL APIs designed for stepping through a checkout. While we've started to consume this API within our Storefront Starter Kit, these APIs should be treated as unstable and subject to change. We've added mutations for setting an anonymous email - `setEmailOnAnonymousCart` and selecting fulfillment options - `selectFulfillmentOptionForGroup`.

**A note on fulfillment options**
Fulfillment options are what we're calling what used to be shipment options. In order to prepare ourselves for several types of fulfillment that do not necessarily include shipping, we're updating the checkout through order models, methods, and now our GraphQL API to be capable of grouping items into "Fulfillment Groups". This opens the door for several new types of fulfillments down the line such as In Store Pickup, Digital Downloads, Digital Key Generation, and anything else you can think up. We're not actively building any of these different fulfillment types into core, but want to ensure that it's possible and there's a clear direction to do so.

## Breaking Changes

- If a plugin adds an "afterCartUpdate" hook, it will no longer be called. Change the plugin code to use appEvents.on("afterCartUpdate" instead. (#4535)
- If a plugin creates or updates a cart, be sure it calls appEvents.emit("afterCartCreate") or appEvents.emit("afterCartUpdate"), respectively, passing the proper arguments. If you do this within an appEvents.on hook for the same event, be sure to wrap the call in conditional logic to avoid an infinite loop. (#4535)
- We've refactored the `Shipment` schema to remove the `items` property. This will cause a breaking change for plugins expecting the items property to be there. Such plugins should be updated to use a combination of itemIds and the main items list. (#4531)
- Removed `requiresShipping` prop from products and catalog products. This has been replaced by an array `supportedFulfillmentTypes`. Reaction's core admin interface did not provide a method for setting this prop, and we've left the `supportedFulfillmentTypes` out of the exiting operator interface. This change will emable us to show a "Shipping"/"Pick Up" selector for other items down the road. Will also permit creation of digital fulfillment types, etc. (#4554)
- The last argument of the setShipmentMethod Meteor method now expects just the method ID rather than the whole method object. Core client code has been updated, but you should update any custom code that calls this method.
- Removed the resetShipmentMethod Meteor method
- The `cart/setAnonymousUserEmail` Meteor method is removed. This does not break any core behavior, but it might require updates to any custom plugins.

## GraphQL DevServer

### Features

- feat(GraphQL): update fulfillment options for group (#4538)
- feat(GraphQL): Add resolver for Cart.totalItemQuantity (#4533)
- feat(GraphQL): add resolver for Cart.checkout (#4507)
- feat(GraphQL): Replace "cart/setAnonymousUserEmail" Meteor method with setEmailOnAnonymousCart mutation (#4564)
- feat(GraphQL): Implement selectFulfillmentOptionForGroup mutation (#4548)

## Fixes

- fix(GraphQL): Fix CartItem.currentQuantity (#4508)

## Meteor App

### Features

- feat: Convert product grid to consume GraphQL data (#4481) .. Resolves #4480
- feat: Fulfillment improvements (#4554)
- feat: Plugin for auto-generated sitemaps (#4413) .. Resolves #4353

### Performance

- perf: improve orders sub speed by rearranging pipeline (#4555)
- perf: Move formatPhoneNumber (and libphonenumber-js) server-side to reduce client bundle (#4517) .. Resolves #4516

### Fixes

- fix: for sidebar unable to be opened (edge condition) (#4546) .. Resolves #4545
- fix(marketplace): Default to Primary Shop when no domains match (#4544)
- fix: sync lowInventoryThreshold number between variants and child options (#4519)
- fix: Product prices showing as \$NaN.undefined on the customer product grid (#4518)

### Refactor

- refactor: Refactor cart / fulfillment hooks (#4535)
- refactor fulfillment items (#4531)
- refactor: resolve reaction error (#4494) .. Resolves #4477
- refactor: Dynamically import Swiper to reduce client bundle size (#4515) .. Resolves #4514

### Chores

- chore: Added production bundle size check to CircleCI (#4521)

### Contributors

- Thanks to @pmn4 for contributing to this release :tada:

# v1.14.1

## Patch release

Resolves issues found after releasing `1.14.0` - one causing jsdoc to fail during CI builds for the `master` branch, and another where method hooks were running incorrectly occasionally for `catalog/publish/products` and `accoutns/addressBookAdd`. See specific PRs for more details.

## Meteor App

### Bugfixes

- fix: Ensure method hooks always run with correct timing (before and after method) (#4537) .. Resolves #4437
- fix: jsdoc promise returns (#4539)
- fix: Null Guarding in GroupsTableCell (#4440)

## Contributors

Thanks to @pmn4 for contributing to this release :tada:

## NPM Package Version Changes

There are no dependency changes in this release

# v1.14.0

## Removing Optional Plugins

As part of our focus simplifying the core Reaction application and improving performance, we've [made the decision to remove optional plugins from the core application](https://blog.reactioncommerce.com/the-road-ahead-product-updates-june-2018/). From our blog post on this topic:

> It’s about quality over quantity. As a part of our initiative to simplify Reaction, we’re focusing on providing one reference application per feature and moving all others over to community-sponsored packages. We’ll be migrating packages, APIs, and schemas over to npm. It’s a standard approach to package management, one that improves the developer experience overall.

Here’s how it will look:

| Category   | Reaction default(s)             | Community package(s)             |
| ---------- | ------------------------------- | -------------------------------- |
| Payments   | Stripe, example payment package | PayPal, Authorize.net, Braintree |
| Taxes      | Flat rate                       | Avalara, TaxCloud, TaxJar        |
| Shipping   | Flat rate                       | Shippo                           |
| Connectors | CSV connector                   | Shopify connector                |

As the first step of this process we've moved a number of packages from the https://github.com/reactioncommerce/reaction repo to independent repositories in the new https://github.com/reaction-contrib organization. You can install these packages by following the instructions located inside of each new repository. Once installed they should work as they did in v1.13. Any issues you have with updating these packages should be filed in the repos created for these packages and not in the core Reaction repo going forward. If you're interested in contributing to or helping to maintain any of the packages that we've moved to reaction-contrib, please reach out to @zenweasel and he can get you setup.

The list of packages that have been removed in this release is as follows:

- Shopify
- TaxCloud
- Avalara
- Authorize.net
- Paypal
- Braintree
- TaxJar
- Advanced Inventory Management
- Shippo
- SMS
- Discount Rates (unused, not the same as our current discount codes)
- Logging (unused by core application)

This work is listed as a breaking change. If your application relies on any of these packages, you will have to install them independently of Reaction going forward. This release will not destroy data associated with these plugins, so you should be able to safely update without losing information. However, please be sure to test this for your specific application before deploying to production and as always, backup your data before updating versions.

## GraphQL Cart

This release contains the Cart and Checkout GraphQL schemas along with several cart queries and mutations. We're starting to make some changes to the core cart schemas for Reaction and the process that we use to create and identify carts.

One of these changes is when we create a cart for a customer. To this point, we've created a cart document for each and every visitor to a Reaction storefront. Going forward we'll be creating carts on demand. This means that a customer will not have a cart associated with them until they first add a product to the cart. This is how we've architected the GraphQL API to work and we've made some changes to the legacy Reaction cart system to put it in sync.

We're signifincantly adjusting the Cart schema as well. The best way to understand all of this will be to read through the updated GraphQL Cart Schema in #4307 and #4390 but I'll try to note some things to be aware of going forward.

A cart will have either an account associated with it or may be anonymous.

A cart will have an array of items associated with them. As we will be lazy in creating carts, when the cart is created this array of items will have at least one item in it. We do not destory carts if a customer removes all items from a cart, so it is possible that there will be an empty array of items inside of a cart.

One of the major changes to carts is related to how we store information necessary to create an order from a cart. We're introducing a new field `checkout` to the cart schema which you can dig into in #4309. This will be where fulfillment information, payment information, addresses and any other information necessary to process a checkout will be stored.

Recognizing the need to be able to handle orders which have items that require different types of fulfillment, we're organizing items into what we're calling "Fulfillment Groups." The most basic example is that a fulfillment group could be a group of items that is getting shipped to a specific address. For an order with `n` items, there can exist up to `n` fulfillment groups within that cart. This specific release doesn't introduce any new functionality for adding new types of fulfillment groups or splitting a single cart into multiple fulfillments, but it does lay the groundwork for splitting orders, creating new fulfillment types such as an in store pickup, ship to store, digital downloads, or generated license keys.

We're currently mapping this new GraphQL Schema to the existing Reaction Simple Schema, but will be transitioning all of our existing schemas to match (more or less) our new GraphQL schemas going forward.

A cart will still be associated with a single shop. This is consistent with current behavior.

There are two GraphQL Queries for fetching carts, one for getting anonymous carts `anonymousCartByCartId` and one for getting account carts `accountCartByAccountId`

This release introduces GraphQL Mutations for creating carts, adding items to carts, removing items from carts, updating cart items, and reconciling carts when a customer with an anonymous cart logs into an account.

`ReconcileCarts` is a new method which replaces and extends our previous `mergeCarts` method with additional functionality. ReconcileCarts has 3 modes: `merge`, `keepAnonymousCart`, and `keepAccountCart`. `merge` is the default mode and works identically to how the existing `mergeCarts` method works, where the anonymous cart is combined with the account cart, items are deduped, and quantities are incremented to match the combined qty of the items in the carts. `keepAnonymousCart` will keep only the items and the checkout information in the anonymous cart, and `keepAccountCart` will do the same but for the Account Cart.

## Breaking Changes

### Meteor App

#### File Organization

- We've moved all files from `/server` into plugins. All imports with paths that begin with /server will need to be changed for any custom code or community plugins. See the file changes in https://github.com/reactioncommerce/reaction/pull/4366/files to see examples of changing import paths from `/server` to relevant plugin paths.

#### Cart

- A cart is not created until items are added. Previously a cart was created for all users, including anonymous users, immediately if one was not found. This is not a breaking change for the core app, but any custom plugins may have code that will need to be updated to handle the possibility of there not being a cart.
- Update the signature of most cart methods to take an optional cartToken string param. Update all places that call these methods to pass in the token for anonymous carts.
- Carts and Orders no longer have userId. They now have accountId. Core client code has been updated, but custom code will need to look up the account for the user and then look up the cart or order from that.
- The CartItem SimpleSchema no longer includes variants and product, i.e., the entire variant and product objects are not copied to the cart item. Instead, certain properties that are needed are copied directly to the CartItem object. For example, item.productSlug. See the updated schema.
- `cart/removeCart` Meteor method behavior is the same as before, but the return value is now `{ cart }`
- The signature of the "cart/setAnonymousUserEmail" method has changed. It now takes cartId, token arguments. The client code that calls it has been updated, but any custom code calling it will need to be updated.
- Accounts.loginWithAnonymous is no longer available to client code. This was only used in one place, and similar logic has replaced it in that spot.
- workflow/pushCartWorkflow and workflow/revertCartWorkflow methods now require that you pass in the cartId rather than guessing which cart you intend.
- In general, be aware that cart.accountId may now be null. Previously, it would be set even for anonymous carts, to the account for the user with "anonymous" role. For now, order.accountId is still set after an anonymous order is placed.
- The "Reaction.sessionId" stored ID is now used only for auto-login of anonymous users. It is not used by any of the cart code. Also, the "Sessions" collection is no longer written to or published to clients. It will not be dropped automatically, but you can drop it if you no longer need it.

#### Checkout

- Stripe checkout now uses [Stripe Elements](https://stripe.com/elements) - for more details see #4325

#### Tags

- We're now limiting the tags publication to show only tags from the current active shop. This is more of a clarification of how this was supposed to work, but if you depended on all tags being published, this will cause unexpected behavior. See #4206 for specific changes.

#### Other

- Removal of previously included ancillary packages listed in the "Removing Optional Plugins" section
- The function `createCatalogProduct` has been moved into it's own file. This function was not being exported and should not create any issues, but be aware.
- The Catalog schema has been changed. It was in a "use at your own risk" state before this, but if you've been using it you may have to migrate some data
- We've removed the core plugin `Logging` which was used only by the Avalara plugin to this point. If you relied on this plugin, you'll need to reinstall it.

### GraphQL

- In the GraphQL context, there is no longer a methods object. Instead you can call any method with context.callMeteorMethod(name, ...args).
- In the GraphQL context, context.queries is now namespaced by which plugin the queries come from. For example, context.queries.userAccount is now context.queries.accounts.userAccount.

## Notable Features

### Deploy to Heroku Button

We've added a deploy to Heroku button which should appear in the project readme now. You can now deploy Reaction to Heroku by clicking the "Deploy to Heroku" button and then filling out hte information required by Heroku.

### Hashing Products

We're now hashing products to determine when a product changes that have not been published to the Catalog. This shows up as an indicator on the publish button when viewing a product that has unpublished changes.

### Serve js and css from CDN

We now provide an option to serve the bundled javascript and css files from a CDN. See #4316 for more information.

### robots.txt

We've added a permissive default `robots.txt` file. This file permits all bots to crawl and disallows bots from crawling `/resources`

## GraphQL DevServer

### Features

- feat: GraphQL Cart Schema (#4307)
- feat: GraphQL Cart checkout schemas (#4390)
- feat: Add anonymousCartByCartId GraphQL query (#4382)
- feat: createCart mutation, addCartItems mutation, and related cart/order schema changes (#4412)
- feat: Meteor-free addressBookAdd method and GraphQL plugin reorg (#4167)
- feat: Add `resolveAccountFromAccountId` resolver (#4495)
- feat: remove cart items (#4474)
- feat: update cart items quantity (#4472)
- feat: create reconcileCarts mutation (#4443)
- feat: Add accountCartByAccountId resolver (#4427)

## Meteor App

### Features

- feat: Shippo address validation (#4086)
- feat: Use token to create Stripe charges (#4325)
- feat: Create deploy to heroku button (#4320)
- feat: enable oplog in development Docker Compose config (#4420)
- feat: Create product hash of published product properties (#4336)
- feat: added CDN settings to reaction (#4316)
- feat: Indicator to notify of pending product changes not yet published to catalog (#4383)
- feat(marketplace): Limit Tags Publication to Those for the Current Shop (#4206)
- feat: add robots.txt file (#4370)
- feat: Remove account from anon carts, don't use session for carts (#4496)
- feat(marketplace): Consideration for Marketplace Shops on Different URLs (#3332)

### Fixes

- fix: update and pin to latest version of sharp package (#4466)
- fix: Use hashtags and tagIds to form tags obj (#4415) .. Resolves #4414
- fix: Marketplace Settings (#4334) .. Resolves #4333
- fix: update dependencies (#4444)
- fix: Invalidate circleci caches (#4432)
- fix: changing product handle throws 404 (#4403) Resolves #4023
- fix: Tax and inventory toggle switches do not work (#4445) Resolves #4401
- fix: Taxcloud with marketplace setup. (#4140) Resolves #4089
- fix: Options now have parent's taxCode (#4182) Resolves #4141
- fix(marketplace): also send notification to shop owners upon order creation (#4295)
- fix: not publishing customer accounts (#4402) .. Resolves #4374
- fix: Can't save discount codes (#4410) .. Resolves #4408
- fix: Discount Codes React Table Not Rendering Correctly (#4411) .. Resolves #4247
- fix: Unable to save custom tax rate (#4405) .. Resolves #4396
- fix: low quantity/sold out flags not saving correctly in db (#4342)
- fix: Scrolling to bottom adds more products to the view (#4243) .. Resolves #4090
- fix: remove react-addons-create-fragment (#4164)
- fix: change session active product when adding new product (#4313)
- fix: missing styles on refund popover (#4300) .. Resolves #4005
- fix: fix permissions of shop social settings (#4312)
- fix: Archived products not being removed from Catalog (#4392)
- fix: Default settings for parcel size (#4083)
- fix: Update prerender.js (#4331)
- fix(marketplace): Product Visibility for Marketplace Shops (#4259) .. Resolves #4092
- fix: mislabeled schema (#4371)
- fix: ActionView Component Typos (#4439)
- fix: Cannot set replyTo or other field options when using Reaction.Email.send (#4380) .. Resolves #4343
- fix: migration error preventing app startup (#4491)
- fix: add media information to Variants and Options (#4468)
- fix: Publish button infinite loop bug (#4488)
- fix: client errors related to domain lookup changes (#4471)

### Performance

- perf: Dynamically import Moment locales to reduce client bundle size (#4455) .. Resolves #4454
- perf: Improve app startup time when large number of Accounts/Users exists (#4449) .. Resolves #4384

### Refactors

- refactor: Use new Reaction component library components for the SMS settings form (#4318)
- refactor: Remove "Catalog" from menu (#4385)
- refactor: Move all /server files to plugins (#4366)
- refactor: Update Catalog Schema (#4421)

### Plugin Migration

- refactor: Remove Shopify plugin (#4395)
- refactor: Remove TaxCloud plugin (#4428)
- refactor: Remove Avalara plugin (#4398)
- refactor: Remove Authorize.net plugin (#4310)
- refactor: Remove Paypal plugin (#4339)
- refactor: Remove Braintree plugin (#4351)
- refactor: Remove disabled TaxJar plugin (#4348)
- refactor: Remove inventory package (#4388)
- refactor: Remove shipping-shippo plugin (#4460)
- refactor: Remove SMS plugin (#4451)
- refactor: Remove unused discount-rates plugin (#4458)
- refactor: remove unused logging (#4476)

### Chores

- chore: CircleCI step for deploying to an existing ECS cluster (#4487)
- chore: make the snyk-security step a dependency for the docker-build step; s… (#4446)

## Contributors

Thanks to @pmn4 and @hrath2015 for contributing to this release :tada:

## NPM Package Version Changes

This is a list of all new, changed, and removed dependencies that exist in our dependency graph for a production build. This does _not_ include dev dependencies.

### New Dependencies

```
@babel/helper-module-imports@7.0.0-beta.51
@babel/types@7.0.0-beta.51
@emotion/babel-utils@0.6.7
@emotion/hash@0.6.5
@emotion/memoize@0.6.5
@emotion/serialize@0.8.5
@emotion/stylis@0.6.12
@emotion/unitless@0.6.5
@emotion/utils@0.7.3
@reactioncommerce/components@0.2.0
@types/graphql@0.12.6
abbrev@1.1.1
aproba@1.2.0
are-we-there-yet@1.1.5
argparse@1.0.10
array.prototype.flat@1.2.1
babel-code-frame@6.26.0
babel-core@6.26.3
babel-core@6.26.3
babel-generator@6.26.1
babel-helpers@6.24.1
babel-messages@6.23.0
babel-plugin-emotion@9.2.6
babel-plugin-macros@2.3.0
babel-plugin-syntax-jsx@6.18.0
babel-register@6.26.0
babel-template@6.26.0
babel-traverse@6.26.0
babel-types@6.26.0
babylon@6.18.0
bl@1.2.2
buffer-alloc-unsafe@1.1.0
buffer-alloc@1.2.0
buffer-fill@1.0.0
check-error@1.0.2
console-control-strings@1.1.0
convert-source-map@1.5.1
cosmiconfig@4.0.0
create-emotion@9.2.6
css-color-keywords@1.0.0
css-to-react-native@2.2.1
csstype@2.5.5
deep-extend@0.6.0
delegates@1.0.0
detect-indent@4.0.0
emotion@9.2.6
esprima@4.0.1
esutils@2.0.2
expand-template@1.1.1
find-root@1.1.0
fs-constants@1.0.0
fs-copy-file-sync@1.1.1
gauge@2.7.4
get-func-name@2.0.0
github-from-package@0.0.0
globals@9.18.0
has-unicode@2.0.1
home-or-tmp@2.0.0
ini@1.3.5
is-directory@0.3.1
is-finite@1.0.2
js-yaml@3.12.0
jsesc@1.3.0
json-parse-better-errors@1.0.2
json5@0.5.1
lodash.debounce@4.0.8
lodash.isequal@4.5.0
lodash.topath@4.5.2
lodash.uniqueid@4.0.1
lodash.unset@4.5.2
node-abi@2.4.3
noop-logger@0.1.1
nopt@1.0.10
npmlog@4.1.2
object-hash@1.3.0
object-is@1.0.1
os-homedir@1.0.2
os-tmpdir@1.0.2
p-try@1.0.0
pathval@1.1.0
prebuild-install@4.0.0
private@0.1.8
raf@3.4.0
rc@1.2.8
react-is@16.4.1
react-lifecycles-compat@3.0.4
react-outside-click-handler@1.2.0
react-stripe-elements@2.0.1
reacto-form@0.0.2
reflect.ownkeys@0.2.0
repeating@2.0.1
require-from-string@2.0.2
safer-buffer@2.1.2
saslprep@1.0.0
slash@1.0.0
spdx-correct@3.0.0
spdx-exceptions@2.1.0
sprintf-js@1.0.3
strip-json-comments@2.0.1
styled-components@3.3.3
stylis@3.5.3
stylis-rule-sheet@0.0.10
tar-fs@1.16.3
tar-stream@1.6.1
to-buffer@1.1.1
to-fast-properties@1.0.3
to-fast-properties@2.0.0
touch@1.0.0
trim-right@1.0.1
which-pm-runs@1.0.0
wide-align@1.1.3
```

### Updated Dependencies

```
ansi-styles@3.2.1
apollo-cache-control@0.0.10
apollo-link@1.2.2
apollo-server-module-graphiql@1.4.0
apollo-tracing@0.1.4
apollo-utilities@1.0.16
async@2.6.1
attr-accept@1.1.3
autosize@4.0.2
aws4@1.7.0
base64-js@1.3.0
bcrypt-pbkdf@1.0.2
body-parser@1.18.3
bowser@1.9.4
brace-expansion@1.1.11
bson@1.0.9
buffer-from@1.1.0
buffer-from@1.1.0
buffer@5.1.0
camelcase@4.1.0
caniuse-lite@1.0.30000865
chai@4.1.2
chalk@2.4.1
classnames@2.2.6
clone@2.1.1
color-convert@1.9.2
color-name@1.1.1
color@3.0.0
combined-stream@1.0.6
commander@2.16.0
concat-stream@1.6.2
configstore@3.1.2
consolidated-events@2.0.2
css-in-js-utils@2.0.1
cuid@2.1.1
d3-color@1.2.0
d3-format@1.3.0
d3-interpolate@1.2.0
d3-scale-chromatic@1.3.0
d3-scale@1.0.7
d3-time-format@2.1.1
d3-time@1.0.8
debug@3.1.0
deep-eql@3.0.1
direction@1.0.2
disposables@1.0.2
dnd-core@2.6.0
dom-helpers@3.3.1
dom7@2.0.7
dtrace-provider@0.8.7
duplexify@3.6.0
ecdsa-sig-formatter@1.0.10
electron-to-chromium@1.3.52
error-ex@1.3.2
es-abstract@1.12.0
extend@3.0.2
fast-deep-equal@1.1.0
fbjs@0.8.17
fibers@2.0.2
form-data@2.3.2
get-caller-file@1.0.3
get-node-dimensions@1.2.1
graphql-extensions@0.0.10
graphql-fields@1.1.0
graphql-relay@0.5.5
has-flag@1.0.0
has@1.0.3
hoist-non-react-statics@2.5.5
hosted-git-info@2.7.1
http-errors@1.6.3
i18next-browser-languagedetector@2.2.2
iconv-lite@0.4.23
ieee754@1.1.12
immutability-helper@2.7.1
inline-style-prefixer@4.0.2
invariant@2.2.4
is-arrayish@0.3.2
is-callable@1.1.4
js-tokens@4.0.0
jwa@1.1.6
jws@3.1.5
libphonenumber-js@1.2.21
lodash-es@4.17.10
loose-envify@1.4.0
lru-cache@4.1.3
make-dir@1.3.0
match-sorter@2.2.3
material-colors@1.2.6
mime-db@1.35.0
mime-types@2.1.19
mimic-fn@1.2.0
mimic-response@1.0.1
minimist@1.2.0
minipass@2.3.3
moment-timezone@0.5.21
moment@2.22.2
mongodb-core@3.1.0
mongodb@3.1.1
nan@2.10.0
nock@9.4.2
node-fetch@2.1.2
node-loggly-bulk@2.2.3
object-keys@1.0.12
object-keys@1.0.12
p-limit@1.3.0
parse-json@4.0.0
path-parser@4.2.0
path-to-regexp@2.2.1
pify@2.3.0
postcss@6.0.23
prerender-node@3.1.1
process-nextick-args@2.0.0
prop-types-exact@1.2.0
prop-types@15.6.2
propagate@1.0.0
pump@1.0.3
pumpify@1.5.1
qs@6.5.2
query-string@5.1.1
radium@0.22.1
raw-body@2.3.3
react-autosuggest@9.3.4
react-autowhatever@10.1.2
react-color@2.14.1
react-cursor-position@2.4.1
react-dates@17.1.0
react-dnd-html5-backend@2.6.0
react-dnd@2.6.0
react-dropzone@4.2.13
react-image-magnify@2.7.0
react-loadable@5.4.0
react-moment-proptypes@1.6.0
react-portal@4.1.5
react-router-dom@4.3.1
react-router@4.3.1
react-select@2.0.0-beta.7
react-side-effect@1.1.5
react-table@6.8.6
react-transition-group@2.4.0
react-with-styles-interface-css@4.0.3
react-with-styles@3.2.1
reaction@1.14.0 /Users/spencer/reaction/reaction
readable-stream@2.3.6
request@2.87.0
resize-observer-polyfill@1.5.0
retry-request@3.3.2
safe-buffer@5.1.2
safe-json-stringify@1.2.0
search-params@2.1.3
semver@5.5.0
shallowequal@1.1.0
sharp@0.20.5
simple-get@2.8.1
slugify@1.3.1
source-map-support@0.5.6
source-map@0.7.3
spdx-expression-parse@3.0.0
spdx-license-ids@3.0.0
sshpk@1.14.2
stable@0.1.8
statuses@1.5.0
string-width@1.0.2
string_decoder@1.1.1
stringstream@0.0.6
stripe@5.10.0
supports-color@5.4.0
sweetalert2@7.25.6
swiper@4.3.3
symbol-observable@1.2.0
tar@4.4.4
tether@1.4.4
tough-cookie@2.3.4
type-detect@4.0.8
type-is@1.6.16
ua-parser-js@0.7.18
underscore@1.9.1
uuid@3.3.2
validate-npm-package-license@3.0.3
velocity-react@1.4.1
warning@4.0.1
whatwg-fetch@2.0.4
which@1.3.1
wordwrap@0.0.3
zen-observable-ts@0.8.9
zen-observable@0.8.8
```

### Removed Dependencies

```
42-cent-base
42-cent-util
@braintree/wrap-promise
@sindresorhus/is
@types/node
UNMET PEER DEPENDENCY graphql@^0.10.0 || ^0.11.0 || ^0.12.0
aphrodite
array.prototype.flatten
authorize-net
base64url
braintree
buffer-crc32
cacheable-request
chain-function
clone-response
connect-query
dateformat
debuglog
deprecate
duplexer3
from2
got
has-symbol-support-x
has-to-string-tag-x
http-cache-semantics
into-stream
is-object
is-plain-obj
is-retry-allowed
isemail
isurl
joi
json-buffer
json-stable-stringify
jsonify
jsonwebtoken
keyv
lodash.isboolean
lodash.isinteger
lodash.isnumber
lodash.once
lowercase-keys
nexmo
normalize-url
p-cancelable
p-is-promise
p-timeout
paypal-rest-sdk
pop-iterate
prepend-http
q
react-addons-create-fragment
react-addons-pure-render-mixin
responselike
rootpath
scmp
shippo
shopify-api-node
sort-keys
stopcock
string-hash
timed-out
topo
twilio
url-parse-lax
url-to-options
weak-map
```

## Metrics

You don't improve what you don't measure. In efforts to improve the size of our bundles, the time to first paint, time to interactive, and overall performance of our applications, we're starting to report on bundle size and some performance metrics in every release. With effort and persistence, we'll see these numbers improve over time.

### Bundle Size

We measure bundle size by building the application using `meteor build` and then measuring the js and css bundle size with the command `wc -c /path/to/js-bundle-file.js`

**JS Modern Browsers:** 4872kb
**JS Legacy Browsers:** 5104kb
**CSS All Browsers:** 392kb

# v1.13.1

This release exclusively includes a patch update to Meteor from `1.7.0.1` to `1.7.0.3`

This release should be installed by anyone on Reaction 1.13.0 and includes an important security update to Node, updating to version 8.11.3 of Node, which is an important security release.

The underlying meteor-babel npm package has also been updated to version 7.0.0-beta.51.

## Security

- security: Update to Meteor 1.7.0.3 (#4368)

# v1.13.0

## Removal of Legacy Product Revision Control system

The major change in this release is that we've removed the existing revision control system in favor of publishing Products to the Catalog. The existing revision control system contained some powerful ideas, but was complex and intertwined into many areas of the app that were not directly related to Product. By removing the old revision control system, we've paved the way to substantially improve product grid performance, especially for Operators and we've simplified the product publication logic.

This removes all code, hooks, collections, and packages related to revision control.

**Breaking changes:**

- Any custom packages that depend on the `Revision` control system.
- Operators will no longer be able to "undo" changes to a product. Instead products are published through the catalog
- Any _unpublished_ changes to products will be lost when upgrading to `1.13.0`. In this release, it's possible that if you were to downgrade that you would see the unpublished changes again, but that may cause unexpected behavior. We recommend either publishing or discarding any changes to your products before upgrading to this release.
- Similarly, any products that have been created but not published will demonstrate unexpected behavior. To avoid this undesirable behavior, publish any newly created, unpublished products prior to upgrading to this release.

- **All plugin authors** will need to update your `package.json` with a change to the babel config similar to what was done [here](https://github.com/reaction-contrib/meteor-authorize-net/commit/f19a5cf7591a17f426e67bd3737af5a4d1c7a64a)

## Update to Meteor 1.7

This update brings some enormous improvements to the amount of time it takes to rebuild the application in development after making a file change. In some (less than perfectly scientific) tests that I ran testing file changes between 1.7 and 1.6.1 I saw 50%-90% improvements in the reload time. Your experience may vary depending on how much you've customized Reaction, your computer specs, and your specific development setup, but I fully expect this to be a noticeable improvement for anyone working with Reaction.

There are some [early](https://github.com/meteor/meteor/issues/9949) [reports](https://github.com/meteor/meteor/issues/9945) that the included update to the MongoDB driver may have [some kinks](https://github.com/meteor/meteor/issues/9944) to work out, so I'd follow those issues on Meteor's repo if that's a cause for concern for you. These reports are all coming from a single person, and we haven't experienced any of these issues in particular yet, but we'll be keeping an eye on them.

##

We ran into a few issues with `npm install` that we resolved in #4317. One product that came out of this investigation was some documentation for how to properly clean up and rebuild docker images in Reaction.

To stop and clean up your images

```sh
  docker-compose down -v --rmi local --remove-orphans
```

To rebuild your Reaction images

```sh
  docker-compose up --build --force-recreate --renew-anon-volumes
```

If you only want to run Reaction and not the GraphQL DevServer

```sh
  docker-compose up --build --force-recreate --renew-anon-volumes reaction
```

If you only want to run the DevServer and not the Meteor app

```sh
  docker-compose up --build --force-recreate --renew-anon-volumes devserver
```

## Meteor App

### Performance

- perf: remove revision control (#4238)
- perf: update to Meteor 1.7 (#4265)

### Bug Fixes

- fix: Use catalog collection for PDP (#4324)
- fix: Import fixture data only if collections empty (#4327) .. Resolves #4326
- fix: Invalid class name: .variant-list-item-{variant.\_id} (#4217)
- fix: NPM build issue in Docker build (#4317)
- fix: add getAutoValues: false to discounts/codes/remove (#4288)
- fix: hadolint image version (#4306)
- fix: CI step failure to tag Docker image with latest release version (#4304)
- fix: admin products publication slowness (#4260)
- fix: remove inventoryPolicy check on low inventory (#4298)

### Refactors

- refactor: non meteor schemas (#4266) .. Resolves #4263

### Tests

- test: new mocks factory (#4276) .. Resolves #4246
- test: run snyk when package.json has changed or base is master (#4285)

### Docs

- docs(jsdoc): document all Meteor Template helpers in 1 @namespace (#3841) .. Resolves #3840

## GraphQL Dev Server

### Features

- feat: add Media to Tag Schema and GraphQL query (#4270)

### Chore

- chore: update default GraphQL query limit values (#4297)

## Contributors

Thanks to @mikeumus for contributing to this release. 🎉

# v1.12.1

## Bug Fixes

- fix: handle products without positions obj .. Resolves #4299

This release is a hotfix for #4299 which was discovered shortly after v1.12.0 was released.

The issue was releated to a type error that was thrown during a migration:

> If any documents in `Catalog` collection do not have a `positions` property, migration fails on startup on first start after migration to v1.12.0. The migration is left locked. The error message is:

```
0|reaction | TypeError: Cannot convert undefined or null to object
0|reaction |     at Function.keys (<anonymous>)
0|reaction |     at items.forEach (imports/plugins/core/versions/server/migrations/25_update_catalog_schema.js:28:12)
```

# v1.12.0

## Breaking changes

We've made some significant changes to the structure of the data that we publish to the Catalog in #4218. We have created an automated migration for these changes in #4272. If you have made other changes to the catalog in your app or in a plugin, this migration may not work out of the box for you. We'd recommend migrating a test or staging instance of your application with similar data before applying this update to your production application.

From the PR notes to #4218, here's a list of the changes

### Method argument change

"products/updateProductPosition" method now takes a tag ID rather than tag name as its third argument

### Media change

The `media` property on catalog items is still an array of objects, but the structure of those objects has changed.

BEFORE:

```js
{
  metadata: {}, // the full metadata object from the Media doc
  thumbnail: "", // a URL
  small: "", // a URL
  medium: "", // a URL
  large: "", // a URL
  image: "", // a URL
}
```

AFTER:

```js
{
  priority, // copied from metadata
  toGrid, // copied from metadata
  productId, // copied from metadata
  variantId, // copied from metadata
  URLs: {
    thumbnail: "", // a URL
    small: "", // a URL
    medium: "", // a URL
    large: "", // a URL
    original: "", // a URL
  }
}
```

Also, the media array is now sorted in ascending `priority` order.

### Deleted and hidden variants change

When published to the catalog, the `variants` array on the catalog item now includes only those variants where `isDeleted` IS NOT true and `isVisible` IS true.

### Product props separated from catalog item props

Most product properties that were formerly on the catalog item itself are now moved to a `product` object property.

### Explicit property copying

Previously all product and variant props were blindly copied into the catalog item. Now, we explicitly copy only the props we want, sometimes changing their names.

### Property name changes

- `variant.taxable -> variant.isTaxable`
- `variant.variantId` added, currently the same as variant.\_id but might not always be. A reference back to the variant in the Products collection.
- `product.taxable -> product.isTaxable`
- `product.productId` added, currently the same as product.\_id but might not always be. A reference back to the product in the Products collection.
- `product.handle -> product.slug`
- `product.hashtags -> product.tagIds`

`product.twitterMsg` and `product.facebookMsg` and `product.googleplusMsg` and `product.pinterestMsg` are converted to a `product.socialMetadata` array like this:

```js
socialMetadata: [
  { service: "twitter", message: product.twitterMsg },
  { service: "facebook", message: product.facebookMsg },
  { service: "googleplus", message: product.googleplusMsg },
  { service: "pinterest", message: product.pinterestMsg }
];
```

### New Pricing Object

We've deprecated the `price` property on catalog products, variants, and options. There is a new property called `pricing`, which is a map keyed by currency code in MongoDB, and in GraphQL is converted to an array.

The GraphQL schema:

```graphql
"The product price or price range for a specific currency"
type ProductPricingInfo {
  """
  A comparison price value, usually MSRP. If `price` is null, this will also be null. That is,
  only purchasable variants will have a `compareAtPrice`.
  """
  compareAtPrice: Float

  "The code for the currency these pricing details applies to"
  currency: Currency!

  """
  UI should display this price. If a product has multiple potential prices depending on selected
  variants and options, then this is a price range string such as "$3.95 - $6.99". It includes the currency
  symbols.
  """
  displayPrice: String!

  "The price of the most expensive possible variant+option combination"
  maxPrice: Float!

  "The price of the least expensive possible variant+option combination"
  minPrice: Float!

  """
  For variants with no options and for options, this will always be set to a price. For variants
  with options and products, this will be `null`. There must be a price for a variant to be
  added to a cart or purchased. Otherwise you would instead add one of its child options to a cart.
  """
  price: Float
}
```

These are currently mapped as follows, but in the future you will be able to have different prices per currency that your shop supports.

```js
pricing: {
      [shopCurrencyCode]: {
        compareAtPrice: variant.compareAtPrice || null,
        displayPrice: variantPriceInfo.range,
        maxPrice: variantPriceInfo.max,
        minPrice: variantPriceInfo.min,
        price: typeof variant.price === "number" ? variant.price : null
      }
    },
```

### Catalog Item props

All product props other than `positions` are now on the `product` object, so there are a few new properties on the catalog item itself:

- \_id (this is no longer the same as the product ID)
- shopId (stays here AND on `product` obj)
- createdAt
- updatedAt

### ReactionProduct.getTag

The `ReactionProduct.getTag` helper function is renamed to `ReactionProduct.getTagIdForPosition` and returns the tag ID rather than name. If there's no tag in the route path, it returns "\_default" rather than the lowercased shop name.

## Meteor App

### Features and Improvements

- feat: Catalog schema changes (#4218)
- feat: Catalog schema migration (#4272)

### Bugfixes

- fix: Limit Products when in Edit Mode (#4256) .. Resolves #4254
- fix: added event param to onBlur method in numericInput component (#4251)
- fix: Load more products working now (#4233) .. Resolves #4090
- fix: show `.00` cents for whole-dollar amounts in price range (#4222)
- fix: get react root node correctly (#4172)

### Tests

- Reduce Risk of Test False Positives (#4033)

### Chores

- chore: Update to our latest eslint config (#4282)
- chore: resolve snyk issues (#4257)
- chore: Use NPM random package (#4208)

## GraphQL Dev Server

### Features and Improvements

- feat: catalog price sort (#4255) .. Resolves #4245
- feat: devserver improvements (#4220)
- feat: add description and name to shop query (#4209)
- feat: catalogItem GQL query (#4200) .. Resolves #4106
- feat: create connection/edge resolver helper (#4225)

### Bugfixes

- fix: hasNextPage being false, even with a known next page (#4249)
- fix: improve hasNext/hasPrevious (#4231)
- fix: pagination (#4228)
- fix: first value pagination (#4204) .. Resolves #4186

### Chores

- chore: access media through devserver app (#4216)

## Docs

- docs: remove community calls from readme.md (#4279)
- docs: clean up jsdoc comments, namespace organization (#4213)

## Contributors

Thanks to @pmn4 for contributing to this release! 🎉

# v1.11.0

The major focus of `v1.11.0` has been on our GraphQL API. We've added most of the queries and mutations that are necessary for building a headless client to interact with `Accounts`. We're actively doing experiments on how we'll recommend connecting to this GraphQL client and we'll start publishing some of our initial client apps to interact with this GraphQL API in the near future.

## GraphQL

- feat: GraphQL remove account from group mutation (#4102)
- feat: GraphQL invite shop member (#4103)
- feat: GraphQL add account to group mutation (#4095)
- feat: GraphQL address remove mutation (#4087)
- feat: GraphQL address update mutation (#4077)
- feat: GraphQL address add mutation (#4068)
- feat: GraphQL roles query (#4076)
- feat: GraphQL group and groups query (#4053)
- feat: GraphQL connections and devserver app (#4048)
- feat: GraphQL add primaryShopId query (#4175)
- feat: GraphQL add setAccountProfileCurrency mutation (#4094)
- feat: GraphQL tags query (#4165)
- feat: GraphQL Update queries to not need Meteor (#4097)
- refactor: GraphQL transform types using resolvers (#4166)
- refactor: GraphQL switch to .graphql files for schema (#4169)
- docs: GraphQL add some missing schema docs (#4160)

## Features

- feat: styling shop slug box for Shopify (#4091) .. Resolves #2780
- feat: convert AddressBook to react (#4054) .. Resolves #3518
- feat: Accept Shop Data when Inviting Shop Owner (#3456)

## Refactors

- refactor: extract schemas API to an npm package (#4149)
- refactor: extract Logger API into new npm package (#4110)
- refactor: extract Hooks API to an npm package (#4147)
- refactor: remove unused Themes collection (#4198)

## CI

- chore: Add snyk check to CI config; Bump base version (#4002)

## Fixes

- fix: preference writing in marketplace (#4111)
- fix: onClick to image too (#4067) .. Resolves #4058
- fix: wait for slugify to show up before returning slug (#4049)
- fix: use numericInput for pricing (#3999) .. Resolves #3821
- fix: credit card accepts invalid expiration date (#3795)
- fix: check permission before publish (#3885) .. Resolves #3754
- fix: multiple instances of Components.Login causes a browser warning (#4044)
- fix: Currency as object (#4156) .. Resolves #4152
- fix: no access-denied in "accounts/setProfileCurrency" for self (#4199)
- fix: client side validation on address book (#4183)
- fix: Fix Simple Schema runtime errors (#4190) .. Resolves #4173
- fix: Remove \_sleepForMs from tests (#4161)
- fix: #4037: Paginate and Filter Orders Subscription on Admin Dashboard (#4038)
- fix: for "Product publication handle regex match issues with similar product handles (#4065)
- fix: #4057: Admin should have media editable (#4072)
- fix: Make shipping discount code case-insensitive (#4082)
- fix: Error when enabling Shopify inventory hooks (#4148)
- fix: Correct some translation errors for i18n/it.json (#4174)
- fix: inventory badge component added #4032 .. Resolves #4009

## Docs

- docs(jsdoc): #3840 DOM module - add @memberof, @method (#3842)
- docs: #3840 jsdoc - document fixtures (#3873)

## Contributors

Thanks to @pmn4, @glmaljkovich, and @awles for contributing to this release

# v1.10.0

## Collection Hooks | Breaking Change!

The biggest change in 1.10.0 is the removal of the [meteor-collection-hooks](https://github.com/matb33/meteor-collection-hooks) package. If your app or plugin is dependent on collection hooks, we'd recommend refactoring to eliminate the need for those types of hooks. If you're not up for refactoring you can just add that package back into your app though you'll lose some of the benefits that Reaction will see by eliminating that dependency. The removal of this package is a breaking change for any plugin that depends on collection hooks or uses the `direct` method to update a collection. For example, `Products.before`, `Products.after`, and `Products.direct` will no longer work. These hooks have all been migrated to our event hook system. If you were using Collection hooks to perform an action that you cannot perform in 1.10.0 with the current set of event hooks, please file an issue and we can determine if we need to add additional event hooks. This change should lead to much simpler code that is easier to understand.

## New GraphQL API

In addition to a few performance updates, refactors, and bug fixes, this release starts the rollout of our GraphQL API. Until further notice, this GraphQL API should be considered a prototype and should not be used for production. If you're interested in following along with our GraphQL work, tracking our [GraphQL issues](https://github.com/reactioncommerce/reaction/issues?utf8=%E2%9C%93&q=is%3Aissue+graphql+) is probably the easiest way for now.

In short, this release adds a prototype GraphQL server running in the Reaction project with the following urls exposed:

```
/graphql - The GraphQL endpoint.
/graphiql - The GraphiQL user interface.
```

We'll be incrementally adding functionality to this GraphQL endpoint, but this release serves as the starting point for our GraphQL api.

## GraphQL

- feat: GraphQL Prototype (#3898) .. Resolves #3935, Resolves #3928, Resolves #3910
- feat: GraphQL Jest testing pattern (#3995) .. Resolves #3936
- feat: Create GraphQL viewer query (#4019)
- feat: Create GraphQL account query (#3991)

## Refactors

- refactor: remove collection hooks in search mongo package (#3889) .. Resolves #3866
- refactor: remove collection hooks for Products collection (#3825)
- refactor: remove media hooks (#4035) .. Resolves #3994
- refactor: hooks in the inventory package to use Hooks.Events (#3887)
- refactor: remove collection hooks package (#4036)

## Performance

- perf: Memoize/Cache getShopId to Reduce DB Load (#3510) .. Resolves #3507

## Fixes

- fix: typo fix (#4000) .. Resolves #3975
- fix: Browser console warning when beginning checkout (#3980)
- fix: PDP Image gallery does not handle portrait sized images well (#3993)
- fix: Cloning products is not reactive (#3964)
- fix: Uploading Product Image (#4029)
- fix: ProductsContainers are not replaceable (#4025)
- fix: ProductGridItem is not replaceable (#4027)

## Tests

- CI: Run Jest and Meteor tests in parallel (#4030)

## Docs

- docs(jsdoc): namespace MethodHooks into its own JSDoc section. (#3844) .. Resolves #3840

# v1.9.0

This release contains a lot of fixes, some of them performance related and several enormous refactors.
The three biggest changes are:

1. We've migrated from the Meteor version of Simple Schema to the npm version. See notes in the breaking changes section below.
2. We've dropped our dependency on the deprecated Meteor-CollectionFS package. We've replaced it with an npm package we've created called [reaction-file-collections](https://github.com/reactioncommerce/reaction-file-collections)
3. We've created a new catalog collection for use on the Product Grid when viewed by a consumer or other user without a product admin role

There's a full list of changes and fixes below, as well as detailed explanations of potential breaking changes and what you might need to do to migrate

## BREAKING CHANGES

This is a breaking change for any plugin that implements or modifies a schema based on the Meteor simple-schema package.

### From the Simple Schema update

This PR updates the `aldeed:simple-schema` Meteor package dependency to instead depend on the `simpl-schema` NPM package, which is the newest release of the same library. As part of this change, there are several breaking changes and other gotchas to be aware of.

IMPORTANT! The NPM package does not play nice with the previous Meteor package. After updating to this Reaction release, run the app one time, and then look at the .meteor/versions file. Make sure that aldeed:simple-schema is not listed. If it is there, that is because you depend on another Meteor package that depends on aldeed:simple-schema. You will have to update or remove any such packages (with meteor remove / meteor add) until aldeed:simple-schema disappears from your .meteor/versions file.
Search your app for any import { SimpleSchema } from "meteor/aldeed:simple-schema" lines that you have added in your custom code, and replace them with import SimpleSchema from "simpl-schema"
Be aware that the package name does not have the "e" on "simpl". (There is a different NPM package called simple-schema with the "e", and that is NOT the one you want.)
If you have your own custom schemas, refer to the SimpleSchema changelog to update them for the breaking changes: https://github.com/aldeed/meteor-simple-schema/blob/master/CHANGELOG.md#200
If you use attachSchema in your code, be aware that passing an array to attachSchema will no longer work. You should first merge all the schemas and then pass the combined schema to attachSchema

Please read the PR if you need more details [Use NPM SimpleSchema rather than Meteor #3331](https://github.com/reactioncommerce/reaction/pull/3331)

### From the removal of CollecitonFS

#### If you've saved the file URLs anywhere, they're now different.

```
/assets/files/:collectionName/:fileId/:filename
```

becomes

```
/assets/files/:collectionName/:fileId/:primaryStoreName/:filename
```

and

```
/assets/files/:collectionName/:fileId/:filename?store=storeName
```

becomes

```
/assets/files/:collectionName/:fileId/:storeName/:filename
```

#### We've deleted some unused Blaze templates rather than update URL handling within them:

- shopBrandImageOption
- ordersListItems
- select
- upload
- productMetaField
- productMetaFieldForm
- metaComponent
- productDetailEdit
- productDetailField
- productImageGallery
- imageDetail
- imageUploader
- productSocial
- variantList
- variant
- Media-related publishing is changed and improved:

#### Publications have been added, removed, or changed:

- `CartItemImage` publication is removed
- `CartImages` now takes an ID
- Added `ProductGridMedia` to replace Media being included with the products publication for the grid
- Added `ProductMedia`
- Added `OrderImages`, similar to `CartImages`, used for order now rather than reusing CartImages

Full notes on the PR to replace CFS #3782

### From the customer product catalog

The old `imports/plugins/included/product-variants/containers/productsContainer.js` has been renamed to `productsContainerAdmin.js` and a new component named `productsContainer.js` now handles which products container to load based on the user's permissions. Full notes on the PR #3876

### From the Dockerfile updates

reactioncommerce/base:v4.0.1 removed the following:

- Removed the conditional MongoDB installation (via \$INSTALL_MONGO env). Use `mongo` as a service in docker-compose, see example in README.
- Removed the conditional PhantomJS installation (via \$INSTALL_PHANTOMJS env). If PhantomJS is required in your build, you can include it in your custom Dockerfile.
  Full notes on the PR

## Dockerfile Updates

- Base image updated to `reactioncommerce/base:v4.0.1` which has:
  - `node:8.9.4` as base image (same Debian base as before, but with Node 8 preinstalled)
  - Meteor 1.6.1 preinstalled
- [Multi-stage build support](https://docs.docker.com/develop/develop-images/multistage-build/).
  This helped reduce the size of the production image by removing un-required dependencies.
- Final production bundle uses `node:8.9.4-slim`

## Docker Compose changes

- Updated existing `docker-compose.yml` to serve as the config for running a local development environment.
- Added a new `docker-compose-demo.yml` for testing out production builds (this is the replacement for the previous `docker-compose.yml`).

## Upgrades

- Use NPM SimpleSchema rather than Meteor (#3331)

## CI

We've updated our circle ci config to use [v2 of Workflows](https://circleci.com/docs/2.0/workflows/). This permits us to run additional automated tests on circle instead of using other services. We now have 6 workflow steps that must pass before a PR can be merged.

## Refactor

- refactor: rename Import to Importer (#3613) .. Resolves ##1364
- refactor: convert search modal wrapper to React (#3853)
- refactor: replace CFS (#3782)
- refactor: customer product grid publishing (#3876) .. Resolves #3662
- refactor: remove unused collection hook (#3950)

## Fix

- fix: inventory updated on shopify sync (#3897) .. Resolves #3718
- fix: settings startup error (#3939)
- fix: email validation (#3899) .. Resolves #3733
- fix: change all email verification links to use tokens (#3884)
- fix: update shopId the right way. (#3947) .. Resolves #3945
- fix: migration version after SimpleSchema NPM merge (#3929)
- fix: ui glitches using dynamic merchandising (#3932)
- fix: setting or changing a products perma-link causes hard refresh (#3755) .. #2246
- fix: removing search-mongo plugin causes errors at startup (#3837) .. Resolves #3797
- fix: `Reaction.getShopId` missing `()` (#3891)
- fix: added delay and loader (#3796) .. #2863
- fix: add back missing browser policy (#3894)
- fix: discount codes limits are not honored (#3824) .. #3783
- fix: remove cfs:graphicsmagick (#3869) .. Resolves #3868
- fix: password validation (#3860) .. Resolves #3854
- fix: set localstorage even when no Meteor.user exists (#3856) .. Resolves #3846
- fix: handle misconfigured Avalara api (#3827) .. Resolves #3813
- fix: fix for "capturing bulk orders throws server side error" (#3822) .. Resolves #3705
- fix: shop switcher opens off-screen (#3809) .. Resolves #3619
- fix: /shop added to URL (#3794) .. Resolves #2810
- fix: adding country code to phone number before sending SMS (#3751) .. Resolves #3597
- fix: changing the permalink before publishing a product results in "not found" (#3748)
- fix: errors when updating default shipping and billing addresses (#3802)
- fix: delayed response in localization settings (#3872)
- fix: handle integer schema type when getting form field type (#3930)
- fix: check for number if sms is enabled. (#3983) .. Resolves #3965
- fix: marketplace shipping (#3981) .. Resolves #3979
- fix: summary not shown in Invoice (#3989)
- fix: dirty badge in product grid does not work (#3984)
- fix: reactivity error when products are not published yet (#3970)
- fix: global route hooks (#3896) .. Resolves #3895
- fix: added all the missing avalara settings fields to the fieldsProps… (#3969)
- fix: publishing group related to current shop (#3943) .. Resolves #3942
- fix: break payment before sending to paypal (#3859) .. Resolves #1236
- fix: delete shipping rates one at a time (#3968)
- fix: card validator (#3892) .. Resolves #3875
- fix: can't input refund properly (#3893) .. Resolves #3703
- fix: clean paymentMethod objects before validating (#3961)
- fix: console error during checkout (#3948)

## Chore

- chore: add imports/plugins/custom to eslint ignore (#3901)
- chore: update Docker base for multi-stage builds (#3653)
- chore: use circleci workflows 2 in circle config (#3959)
- chore: remove ability to load Meteor.settings from settings.json (#3951)
- chore: upgrade react-dates to 16.3.6 (#3952)

## Docs

- docs(jsdoc) - document and namespace Router.Hooks methods (#3874) .. Resolves #3840

## Contributors

Thanks to @pmn4 for contributing to this release!

# v1.8.2

## Fixes

- fix: added unique to slug (#3745) .. Resolves #2736
- fix: Correct Inventory updates when canceling an order (#3776)
- fix: bulk order status corrected (#3807) .. Resolves #3692
- fix: order refunding number input (#3826) .. Resolves #3702
- fix: Changing user currency does not update prices (#3835)
- fix: Fix invite shop owner (#3845) .. Resolves #3836

## Performance

- perf: performance upgrades by refactoring shopSelectDropdown Trackers (#3651)
- perf: Improve unnecessary translation loading (#3838)

## Features

- feat: Allow for ShopId when adding Brand Assets (#3529)

## Refactor

- refactor: Call OrdersList as a Component (#3848)

## Chore

- chore: Add CodeTriage badge to reactioncommerce/reaction (#3666)
- chore: Update React to 16.2.0 (#3801)

## Docs

- docs(jsdoc): Namespace Hooks.Events methods and add examples (#3843) .. Resolves #3840

## Contributors

Thanks to @pmn4 and @willmoss1000 for contributing to this release

# v1.8.1

## Fixes

- (fix): email status (#3781) .. Resolves #3701
- (fix): cannot search accounts in search modal (#3829)

# v1.8.0

## Meteor 1.6.1

This release upgrades Reaction to Meteor 1.6.1

This is a possible BREAKING CHANGE. We've done our best to keep core reaction backwards compatible with this release, but as this update includes bumping to Babel 7, if you have plugins that depend on Babel 6, they will break.
The [Meteor 1.6.1 announcement](https://blog.meteor.com/announcing-meteor-1-6-1-50aad71da4e6) or [release notes](https://github.com/meteor/meteor/blob/master/History.md#v161-2018-01-19) are the best places to go for help debugging problems specific to Meteor introduced by this release. Additionally, you may want to check out Babel's own guide on [Upgrading to Babel 7](https://babeljs.io/blog/2017/03/01/upgrade-to-babel-7) or [Planning for Babel 7](https://babeljs.io/blog/2017/09/12/planning-for-7.0)

**The biggest change in this release is that we're upgrading to Babel 7.**

```
"@babel/runtime": "7.0.0-beta.38",
```

and in our `dev-dependencies`

```
"@babel/cli": "7.0.0-beta.38",
"@babel/core": "7.0.0-beta.38",
"@babel/preset-react": "7.0.0-beta.38",
"babel-preset-meteor": "7.0.0-beta.38-1"

```

Our babel presets now looks like this:

```
"presets": []
```

Yes, we've removed `stage-2` and `env` from our presets. That's recommended as meteor now includes `babel-preset-meteor`

Please see the PR #3615 for even more detail on what has changed in the update to Meteor 1.6.1

## ESLint

This release introduces the following changes to our .eslintrc file

#### jsx-a11y

We've added the recommended set of rules for [jsx-a11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y).
Reaction has always maintained a commitment to accessibility and adding this rule set provides linting rules to help enforce Aria and a11y compliance.

```
"extends": [
  "plugin:jsx-a11y/recommended"
],
```

#### Base rule set

We've added the following base eslint rules. You can find their descriptions and examples of failing and passing code here: https://eslint.org/docs/rules/

```
"array-bracket-spacing": ["error", "never"],
"array-callback-return": ["error", { "allowImplicit": true }],
"arrow-body-style": ["error", "as-needed", { "requireReturnForObjectLiteral": false }],
"arrow-parens": [ "error", "always", { "requireForBlockBody": true }],
"no-await-in-loop": "error",
"no-bitwise": "error",
"no-case-declarations": "error",
"no-confusing-arrow": ["error", { "allowParens": true }],
"no-empty-pattern": "error",
"no-lonely-if": "error",
"no-mixed-operators": ["error", {
  "groups": [
    ["%", "**"],
    ["%", "+"],
    ["%", "-"],
    ["%", "*"],
    ["%", "/"],
    ["**", "+"],
    ["**", "-"],
    ["**", "*"],
    ["**", "/"],
    ["&", "|", "^", "~", "<<", ">>", ">>>"],
    ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
    ["&&", "||"],
    ["in", "instanceof"]
  ],
  "allowSamePrecedence": false
}],
"no-multi-assign": ["error"],
"no-multi-spaces": ["error", { "ignoreEOLComments": false }],
"no-plusplus": "error",
"no-prototype-builtins": "error",
"no-tabs": "error",
"no-undef-init": "error",
"no-unneeded-ternary": ["error", { "defaultAssignment": false }],
"no-unsafe-finally": "error",
"no-useless-computed-key": "error",
"no-useless-concat": "error",
"no-useless-constructor": "error",
"no-useless-escape": "error",
"no-void": "error",
"object-curly-newline": ["error", { "ObjectExpression": { "multiline": true, "consistent": true }, "ObjectPattern": { "multiline": true, "consistent": true } }],
"object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }],
"operator-assignment": ["error", "always"],
"prefer-destructuring": ["error", {
  "VariableDeclarator": {
    "array": false,
    "object": true
  },
  "AssignmentExpression": {
    "array": true,
    "object": true
  }
}, {
  "enforceForRenamedProperties": false
}],
"prefer-rest-params": "error",
"prefer-spread": "error",
"prefer-template": "error",
"rest-spread-spacing": ["error", "never"],
```

## Collection Hooks

We've removed the Collection Hooks package. This may be a breaking change if you're relying on Collection Hooks in your plugins. You can follow our examples to remove the Collection Hooks dependencies from your plugins or (not recommended) you can install the collection hooks meteor package back into your application without error.

#### We've replaced Accounts and Revisions Collection Hooks in #3642

- Replaced all Account & Revision .before, .after collection hooks to use Hooks.Events API.
- Updated Revisons.after.update(callback) to be Hooks.Events.add("afterRevisionUpdate", callback) and added Hooks.Events.run("afterRevisionUpdate", userId, revision) after every Revisons.update(...) call.
- Updated Accounts.after.insert(callback) to be Hooks.Events.add("afterAccountsInsert", callback) and added a Hooks.Events.run("afterAccountsInsert", userId, user) after every Accounts.insert(...) call.
- Updated Accounts.after.remove(callback) to be Hooks.Events.add("afterAccountsRemove", callback) and added a Hooks.Events.run("afterAccountsRemove", userId, user) after every
  Accounts.remove(...) call.
- Updated Accounts.after.update(callback) to be Hooks.Events.add("afterAccountsUpdate", callback) and added a Hooks.Events.run("afterAccountsUpdate", userId, user) after every Accounts.update(...) call.
- Removed .direct from any Accounts or Revisions collection calls

## Breaking Changes

There are potentially breaking changes you should be aware of in this release.

- (breaking, feat) CoreLayout should probe for React component as fallback (#3524) .. Resolves #3523
  A plugin which has named React components identically to Blaze templates in core may no longer work.
- (breaking, refactor) Remove unnecessary code in Media subscription. (#3558) .. Resolves #3548
  We've renamed the `Media` subscription located in `client/modules/core/subscriptions.js`. This subscription's content has not changed, but is now more aptly named `BrandAssets`. This will only cause problems if you were subscribing to the `Media` publication seprately in your plugin.
- (fix): remove "admin" permission from shop manager role (#3505) .. Resolves #3541
  We've removed the `admin` role from the default role set that is granted to the Shop Manager group. This should not affect any existing shops, but if you have plugins or users that rely on the `admin` role being granted to the Shop Manager group you may need to update your plugins.
- (refactor): replace imagemagick with sharp (#3631) .. Resolves #3482
  This is only a breaking change if you have a plugin that depends on `gm`. It should be trivial to replace with `sharp` and this PR serves as an example of how to do so.
  Replace GraphicMagick/ImageMagick with sharp and remove dependency on `gm`
  Add sharp to the project and dynamically loads where necessary
  Update image transforms to to use the sharp() functions.
  Refactor the "Media" FS.Collection to map the image transforms through a buildGFS() function to create each FS.Store.GridFS collection.
- (refactor): dynamically import moment.js (#3602) .. Resolves #2635
  Provides `withMoment` HOC to wrap components that use moment.
  May cause breaking changes if you relied on any of the following Blaze templates or helpers which are no longer used in core:
  Remove `timezoneOptions` Blaze template helper from `client/modules/core/helpers/templates.js`, as it's no longer used in any core files.
  Remove `ordersList`, `orderPage/details` and `orderPage` Blaze templates, which were replaced by React templates
  Move `dateFormat` Blaze template helper out of the global helpers, and into a specific template helper, since it's only used in one place
- Babel 7 / Meteor 1.6.1 update mentioned in detail at the beginning of these release notes.

### Dependency Update

- (chore): update node dependencies (#3630)
  - Updates the following npm packages by a major version number: `babel-jest`, `jest`, `libphonenumber-js`
  - Updates the following npm packages bya minor version number: `authorize-net`, `autoprefixer`, `babel-eslint`, `braintree`, `core-js`, `enzyme-to-json`, `enzyme`, `eslint-plugin-react`, `i18next`, `moment`, `nexmo`, `nock`, `node-loggly-bulk`, `paypal-rest-sdk`, `postcss`, `radium`, `react-dropzone`, `react-image-magnify`, `react-onclickoutside`, `react-select`, `react-table`, `react-tether`, `shopify-api-node`, `stripe`, `sweetalert2`, `swiper`, `twilio`, `velocity-animate`

### React Conversion

- We've converted the Avalara Setting page to React (see #3348)

### Refactor

- (refactor): upgrade Meteor to 1.6.1 (#3615) .. Resolves #3029
- (refactor): eslint-9 and Aria (#3582) .. Resolves #3574
- (refactor): Enable eslint prefer-destructuring (#3610) .. Resolves #3573
- (refactor): Fix warnings after turning on eslint prefer-destructuring (#3598) .. Resolves #3573
- (refactor): eslint rule updates (1) (#3578) .. Resolves #3566
- (refactor): eslint errors (#3604) .. Resolves #3570
- (refactor): eslint rules 4 (#3599) .. Resolve #3569
- (refactor): fix eslint and ARIA issues for notifications (#3593) .. Resolves #3574
- (refactor): Deprecate meteor sAlert version (#3620) .. Resolves #3550
- (refactor): import Reaction from /client|server|lib/api when possible (#3611) .. Resolves unreported issue
- (refactor): remove theme editor (#3614) .. Resolves #2468
- (refactor): remove meteor-collection-hooks dependency for orders (#3639) .. Resolves #3632
- (refactor): 3636 nnnnat accounts revisions hooks events (#3642)
- (refactor): remove TranslationProvider from lower level components (#3661)
- (refactor): Converting Avalara Setting page to React (#3348)
- (refactor): Dynamically import moment.js (#3602)
- (refactor): replace imagemagick with Sharp (#3631) .. Resolves #3482
- (refactor): removed analytics plugin (#3814) .. Resolves #2301
- (refactor): use Events.Hooks instead of meteor collection hooks for cart events that trigger discount calculations (#3647)
- (refactor): replace vsivsi:job-collection for npm module @reactioncommerce/job-queue (#3641) .. Resolves #3551
- (refactor): nnnnat dynamic transliteration (#3749) .. Resolves #2634

### Style

- Add CSS class to generic product fields (#3609) .. Resolves #3608

### Fixes

- (fix): Undefined property: Reaction.Router.current().queryParam (#3384) .. Resolves #3496
- (fix): Cart image & Remove cart icon alignment fixes (#3740)
- (fix): Test Shopify credentials before saving. (#3468) .. Resolves #3371
- (fix): Accounts admin: Check for return value of modal dialog. (#3659)
- (fix): Display orderId instead of cartId (#3726) .. Resolves #3709
- (fix): Marketplace - allow users to become sellers (#3725) .. Resolves #3617
- (fix): substitute "-" for "/" when tagging docker image (#3739)
- (fix): Zip is optional (#3738) .. Resolves #3530
- (fix): Prevent mobile views having elements that are being cut off. (#3737)
- (fix): Added css to make OR visible (#3736) .. Resolves #3293
- (fix): Css to make whole title clickable (#3735) .. Resolves #3487
- (fix): Added space to Taxcloud notice (#3722) .. Resolves #3720
- (fix): shopify sync (#3663) .. Resolves #3502
- (fix): restore remove from cart functionality (#3657)
- (fix): Add missing address2 details (#3643)
- (fix): Cannot complete checkout on second visit when using Anonymous user (#3640)
- (fix): Fulfilling part of a multi-merchant order removes other parts of order (#3358) .. Resolves #3354
- (fix): update action view size handling to fix shipping settings cutoff (#3759) .. Resolves #3396
- (fix): Audit Product Images and update to always use optimized versions (#3730) .. Resolves #3637
- (fix): Product url should open product detail page when user clicks on an item in the cart drawer (#3758) .. Resolves #3660
- (fix): error when creating/update groups and/or group permissions for non-admin user (#3665) .. Resolves #3638
- (fix): PDP placeholde image display (#3812)
- (fix): handle invalid card details with Authorize.net (#3538) .. Resolves #3519
- (fix): can't change localization values (#3817) .. Resolves #3811
- (fix): shippo calculation error (#3774)
- (fix): Add permission checks to template method and publication (#3606)
- (fix): added currency formatting (#3808) .. Resolves #2286
- (fix): PDP placeholde image display (#3812)
- (fix): Sending the text to G+ (#3790) .. Resolves #2292
- (fix): Edit address when already present (#3788) .. Resolves #3784
- (fix): NavBar made only once (#3779) .. Resolves #3761
- (fix): Add css to truncate (#3746) .. Resolves 3499:
- (fix): Checking for shipping address and billing address (#3771) .. Resolves #3766
- (fix): remove spinner before mounting (#3806) .. Resolves #3805
- (fix): Don't use `default` for moment in invoice (#3816) .. Resolves #3815
- (fix): Remove methods deprecated in 1.5 (#3744) .. Resolves #2882
- (fix): handle invalid card details with Authorize.net (#3538) .. Resolves #3519
- (fix): error when creating/update groups and/or group permissions for non-admin user (#3665)
- (fix): Product url should open product detail page when user clicks on an item in the cart drawer (#3758)
- (fix): error when switching table layout in order dashboard (#3773)
- (fix): mobile subnav (#3775) .. Resolves #3679

### Chores

- (chore): Build Docker image, tag, and push for every branch (#3629) .. Part of #2858
  Updates our CI build process to build and tag docker images on every push to github.
  We are now tagging docker images with the `SHA1`, the `git-branch-name`, any `git tags` and tagging `latest` if there is a push to Master with the latest tag. You can see all of tagged docker images on our docker hub. https://hub.docker.com/r/reactioncommerce/reaction/tags/
- (chore): Add sentence to pull request template requesting images for UIX PRs (#3741)
- (chore): Update pull request template (#3687)
- (chore): update node dependencies (#3630)
- (chore): New build step "Asset Provisioning" (#3335)
- (chore): Remove methods deprecated in 1.5 (#3744)
- (chore): update README.md links to issue tags and Contributing Guide (#3700)
- (chore): add link to Contributing Guide in docs (#3688)

### Performance

- (perf): dynamically import DayPickerRangeController (#3622) .. Part of #3621
- (perf): remove kadira:dochead meteor package and add needed functions to a core plugin (#3625) .. Resolves #3548
- (perf): flatten startup code and speed up translation import (#3592)
- (perf): Don't rerender on failed sign in, (#3664)
- (perf): User prefs stored in Accounts (#3463) .. Resolves #3404
- (perf): dynamically load transliteration (#3749) .. Resolves #2634
- (perf): remove meteor and babel-preset-react from babel presets (#3800)

### I18n

- (i18n): Updated French translations (#3713)
- (i18n): Changed all instances of 'shoify' to Shopify (#3723) .. Resolves #3712
- (i18n): Update en.json (#3787)

## Contributors

Thanks to @thetre97, @loanlaux, @wackywombaat12 and @codejockie for contributing to this release
