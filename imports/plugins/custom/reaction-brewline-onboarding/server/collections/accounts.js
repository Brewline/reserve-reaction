import { Accounts } from "/lib/collections";
import { Workflow } from "/lib/collections/schemas";

Accounts.attachSchema({
  onboarding: {
    type: Workflow,
    optional: true
  }
});
