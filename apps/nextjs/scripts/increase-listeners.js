/**** 
   Because we have a reasonably complex Next.js project now,
   we're sometimes running into the default max listeners limit.
   This script increases the limit to 20, which should be enough
   so that we don't run into this issue. 
   
   Potentially, if we decide to move to Turbopack for compilation
   in local development, we could remove this script. 
   
***/

// Increase the limit of max listeners
require("events").EventEmitter.defaultMaxListeners = 20;

// Run the original command
require("child_process").spawn(process.argv[2], process.argv.slice(3), {
  stdio: "inherit",
});
