/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { structuredLogger, aiLogger } from "@oakai/logger";
import { EventSchemas, Inngest } from "inngest";
import getConfig from "next/config";

import types from "../functions/event-types";
import { eventLogger } from "../middleware/eventLogger";

const log = aiLogger("core");

let serverRuntimeConfig;
try {
  const { serverRuntimeConfig: nextServerRuntimeConfig } = getConfig();
  serverRuntimeConfig = nextServerRuntimeConfig;
} catch (e) {
  log.error("No Next environment", e);
}

const CONTEXT = serverRuntimeConfig?.DEPLOY_CONTEXT as string | undefined;
const BRANCH = serverRuntimeConfig?.BRANCH as string | undefined;

function getInngestEnv() {
  if (CONTEXT === "production") {
    return "production";
  } else if (CONTEXT === "deploy-preview" && BRANCH) {
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
