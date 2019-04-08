import UntappdClient from "node-untappd";

export default function getUntappdClient() {
  // TODO: this feels like a meteor dependency
  const { ServiceConfiguration } = Package["service-configuration"];

  const config =
    ServiceConfiguration.configurations.findOne({ service: "untappd" });

  if (!config) {
    throw new ServiceConfiguration.ConfigError();
  }

  const debug = false;
  const untappd = new UntappdClient(debug);
  untappd.setClientId(config.clientId);
  untappd.setClientSecret(config.secret);

  return untappd;
}
