import { pick } from "lodash";

const keysWhitelist = [
  "auth_rating",
  "beer_abv",
  "beer_active",
  "beer_description",
  "beer_ibu",
  "beer_label",
  "beer_label_hd",
  "beer_name",
  "beer_slug",
  "beer_style",
  "bid",
  "brewery",
  "created_at",
  "is_homebrew",
  "is_in_production"
];

// // for reference, these keys are ignored (this may be useful for future updates
// // to the API response)
// const keysBlacklist = [
//   // live data, grab it on the fly if you need it, or update it periodically
//   "rating_count",
//   "rating_score",
//   "stats",
//   "media",
//   "checkins",
//   "similar", // looks like a dope feature, but some variable data in there. request on the fly if needed
//   "weighted_rating_score",
//   "vintages",
//   "updatedAt",

//   // user-specific data
//   "wish_list",
//   "friends",

//   // not sure how this would be useful atm... not a great reason to blacklist it, but :shrug:
//   "brewed_by"
// ];

export default function scrubUntappdBeer(beer) {
  return pick(beer, keysWhitelist);
}
