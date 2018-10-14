// import { compose } from "recompose";
// import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { registerComponent } from "@reactioncommerce/reaction-components";

import SaleNotFound from "./sale-not-found-component";

// function composer(props, onData) {
//   onData();
// }

// registerComponent("SaleNotFound", SaleNotFound, composeWithTracker(composer));

// export default compose(composeWithTracker(composer))(SaleNotFound);

registerComponent("SaleNotFound", SaleNotFound);
