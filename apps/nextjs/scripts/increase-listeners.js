// Increase the limit of max listeners
require("events").EventEmitter.defaultMaxListeners = 20;

// Run the original command
require("child_process").spawn(process.argv[2], process.argv.slice(3), {
  stdio: "inherit",
});
