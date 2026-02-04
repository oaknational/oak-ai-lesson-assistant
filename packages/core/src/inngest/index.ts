import { aiLogger, structuredLogger } from "@oakai/logger";

import { EventSchemas, Inngest } from "inngest";

import types from "../functions/event-types";
import { eventLogger } from "../middleware/eventLogger";

const log = aiLogger("core");

const CONTEXT = process.env.VERCEL_ENV;
const BRANCH = process.env.VERCEL_GIT_COMMIT_REF;

function getInngestEnv() {
  if (CONTEXT === "production") {
    return "production";
  } else if (CONTEXT === "preview" && BRANCH) {
    // Naively slugify, removing any non-alphanumeric
    return BRANCH.replace(/\W/g, "-");
  } else {
    return "development";
  }
}

function isJestEnvironment() {
  return process.env.JEST_WORKER_ID !== undefined;
}

const inngestEnv = getInngestEnv();
const inngestEventKey = process.env.INNGEST_EVENT_KEY;

if (!inngestEventKey) {
  throw new Error("Missing env var INNGEST_EVENT_KEY");
}

export const inngest = new Inngest({
  name: "Oak AI",
  id: "oak-ai",
  schemas: new EventSchemas().fromZod(types),
  eventKey: inngestEventKey,
  env: inngestEnv,
  logger: structuredLogger,
  middleware: [eventLogger(inngestEnv, inngestEventKey)],
  isDev: process.env.NODE_ENV === "development" || isJestEnvironment(),
});
