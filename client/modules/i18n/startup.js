import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import i18nextLocalStorageCache from "i18next-localstorage-cache";
import i18nextSprintfPostProcessor from "i18next-sprintf-postprocessor";
import i18nextJquery from "jquery-i18next";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Tracker } from "meteor/tracker";
import { Reaction } from "/client/api";
import { Shops, Translations, Packages } from "/lib/collections";
import { getSchemas } from "@reactioncommerce/reaction-collections";
import i18next, { getLabelsFor, getMessagesFor, i18nextDep, currencyDep } from "./main";
import { mergeDeep } from "/lib/api";

//
// setup options for i18nextBrowserLanguageDetector
// note: this isn't fully operational yet
// language is set by user currently
// progress toward detecting language
// should focus around i18nextBrowserLanguageDetector
//
const options = {
  // order and from where user language should be detected
  order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],

  // keys or params to lookup language from
  lookupQuerystring: "lng",
  lookupCookie: "i18next",
  lookupLocalStorage: "i18nextLng",

  // cache user language on
  caches: ["localStorage", "cookie"],
  // optional htmlTag with lang attribute, the default is:
  htmlTag: document.documentElement
};

Meteor.startup(() => {
  // use tracker autorun to detect language changes
  // this only runs on initial page loaded
  // and when user.profile.lang updates
  Tracker.autorun(() => {
    if (Reaction.Subscriptions.PrimaryShop.ready() &&
        Reaction.Subscriptions.MerchantShops.ready() &&
        Meteor.user()) {
      let shopId;

      // Choose shop to get language from
      if (Reaction.marketplaceEnabled && Reaction.merchantLanguage) {
        shopId = Reaction.getShopId();
      } else {
        shopId = Reaction.getPrimaryShopId();
      }

      const packageNamespaces = [];

      const packages = Packages.find({
        shopId
      }, {
        fields: {
          name: 1
        }
      }).fetch();
      for (const pkg of packages) {
        packageNamespaces.push(pkg.name);
      }


      const shop = Shops.findOne({
        _id: shopId
      });

      let language = (shop && shop.language) || "en";

      if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.lang) {
        language = Meteor.user().profile.lang;
      }
      //
      // subscribe to user + shop Translations
      //
      return Meteor.subscribe("Translations", language, () => {
        // fetch reaction translations
        const translations = Translations.find({}).fetch();

        //
        // reduce and merge translations
        // into i18next resource format
        //
        let resources = {};
        translations.forEach((translation) => {
          const resource = {};
          resource[translation.i18n] = translation.translation;
          resources = mergeDeep(resources, resource);
        });

        //
        // initialize i18next
        //
        i18next
          .use(i18nextBrowserLanguageDetector)
          .use(i18nextLocalStorageCache)
          .use(i18nextSprintfPostProcessor)
          .init({
            detection: options,
            debug: false,
            ns: packageNamespaces, // translation namespace for every package
            defaultNS: "core", // reaction "core" is the default namespace
            fallbackNS: packageNamespaces,
            lng: language, // user session language
            fallbackLng: shop ? shop.language : null, // Shop language
            resources
          }, () => {
            // someday this should work
            // see: https://github.com/aldeed/meteor-simple-schema/issues/494

            // Loop through registered Schemas
            const Schemas = getSchemas();
            for (const schema in Schemas) {
              if ({}.hasOwnProperty.call(Schemas, schema)) {
                const ss = Schemas[schema];
                ss.labels(getLabelsFor(ss, schema));
                ss.messages(getMessagesFor(ss, schema));
              }
            }

            i18nextDep.changed();

            // global first time init event finds and replaces
            // data-i18n attributes in html/template source.
            $("[data-i18n]").localize();

            // Set language prop on html element
            $("html").prop("lang", language);

            // apply language direction to html
            if (i18next.dir(language) === "rtl") {
              return $("html").addClass("rtl");
            }
            return $("html").removeClass("rtl");
          });
      }); // return
    }
  });

  // use tracker autorun to detect currency changes
  // this only runs on initial page loaded
  // and when user.profile.currency updates
  // although it is also triggered when profile updates ( meaning .lang )
  Tracker.autorun(() => {
    const user = Meteor.user();

    if (Reaction.Subscriptions.PrimaryShop.ready() &&
        Reaction.Subscriptions.MerchantShops.ready() && user) {
      if (user.profile && user.profile.currency) {
        currencyDep.changed();
      }
    }
  });
  //
  // init i18nextJquery
  //
  i18nextJquery.init(i18next, $, {
    tName: "t", // --> appends $.t = i18next.t
    i18nName: "i18n", // --> appends $.i18n = i18next
    handleName: "localize", // --> appends $(selector).localize(opts);
    selectorAttr: "data-i18n", // selector for translating elements
    targetAttr: "data-i18n-target", // element attribute to grab target element to translate (if diffrent then itself)
    parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
  });

  // global onRendered event finds and replaces
  // data-i18n attributes in html/template source.
  // uses methods from i18nextJquery
  Template.onRendered(function () {
    this.autorun((function () {
      return function () {
        i18nextDep.depend();
        $("[data-i18n]").localize();
      };
    })(this));
  });
});
