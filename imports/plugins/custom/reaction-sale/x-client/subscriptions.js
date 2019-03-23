import { Reaction } from "client/api";

const { Subscriptions } = Reaction;

Subscriptions.Sales = Subscriptions.Manager.subscribe("Sales");
