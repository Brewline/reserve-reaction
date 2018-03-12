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
