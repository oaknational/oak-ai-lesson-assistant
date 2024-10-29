import type { NextRequest } from "next/server";

import { withSentry } from "@/lib/sentry/withSentry";

import { handleChatPostRequest } from "./chatHandler";
import type { Config } from "./config";
import { defaultConfig } from "./config";

async function postHandler(req: NextRequest): Promise<Response> {
  const config: Config = defaultConfig;
  return handleChatPostRequest(req, config);
}

async function getHandler(): Promise<Response> {
  return new Response("Server is ready", { status: 200 });
}

export const POST = withSentry(postHandler);

export const GET = withSentry(getHandler);
