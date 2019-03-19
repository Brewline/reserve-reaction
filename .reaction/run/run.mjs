// Assumes Node 8.x
import _ from "lodash";
import childProcess from "child_process";
import Log from "./logger";

function run() {
  // Whatever debugging-related command line arguments were passed in to
  // the first node process, forward them along through meteor
  const inspect = process.argv
    .filter((arg) => arg.startsWith("--inspect"))
    .join(" ");
  const port = process.argv.find((a) => a == "PORT" ) || "3000";
  let cmd = `meteor run --no-lint --no-release-check --raw-logs ${inspect} --port ${port}`;

  Log.info(`Running command: ${cmd}`);
  cmd = `REACTION_METEOR_APP_COMMAND_START_TIME=${Date.now()} ${cmd}`;

  try {
    childProcess.execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    Log.default(err);
    Log.error("\nError: App failed to start");
    process.exit(1);
  }
}

run();
