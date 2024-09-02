import { NextRequest } from "next/server";

import { withSentry } from "@/lib/sentry/withSentry";

import { handleChatPostRequest } from "./chatHandler";
import { Config, defaultConfig } from "./config";

async function postHandler(req: NextRequest): Promise<Response> {
  const config: Config = defaultConfig;
  return handleChatPostRequest(req, config);
}

export const POST = withSentry(postHandler);
