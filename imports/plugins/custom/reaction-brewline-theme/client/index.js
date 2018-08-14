import { Router } from "/client/api";

import "./favicon";

function addBodyClass() {
  if (addBodyClass.oneAndDone) { return; }

  document.querySelector("body").setAttribute("data-ready", "true");

  addBodyClass.oneAndDone = true;
}

// function logSomeContext(context) {
//   console.log("The current route details...");
//   console.log("Params: ", context.params);
//   console.log("Query Params: ", context.queryParams);
//   console.log("Path: ", context.path);
//   console.log("The route object: ", context.route);
// }

// log out route details on every route
Router.Hooks.onEnter(addBodyClass);
