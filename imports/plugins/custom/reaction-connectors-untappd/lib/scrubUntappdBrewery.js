import { pick } from "lodash";

const keysWhitelist = [
  "beer_count",
  "brewery_description",
  "brewery_id",
  "brewery_in_production",
  "brewery_label",
  "brewery_label_hd",
  "brewery_name",
  "brewery_page_url",
  "brewery_slug",
  "brewery_type",
  "brewery_type_id",
  "country_name",
  "contact",
  "is_independent",
  "location",
  "locations"
];

// // for reference, these keys are ignored (this may be useful for future updates
// // to the API response)
// const keysBlacklist = [
//   // live data, grab it on the fly if you need it, or update it periodically
//   "beer_list",
//   "checkins",
//   "claimed_status",
//   "media",
//   "rating",
//   "stats",
//   "updatedAt",

//   // not sure how this would be useful atm... not a great reason to blacklist it, but :shrug:
//   "owners"
// ];

export default function scrubUntappdBrewery(brewery) {
  return pick(brewery, keysWhitelist);
}
