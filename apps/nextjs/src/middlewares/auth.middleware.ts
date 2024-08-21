import {
  ClerkMiddlewareAuth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { sentrySetUser } from "@/lib/sentry/sentrySetUser";

const publicRoutes = [
  "/api/health",
  "/aila/health",
  "/api/trpc/main/health.check",
  "/api/trpc/chat/chat.health.check",
  /**
   * The inngest route is protected using a signing key
   * @see https://www.inngest.com/docs/faq#my-app-s-serve-endpoint-requires-authentication-what-should-i-do
   */
  "/api/inngest",
  /**
   * TRPC handles authentication with protected/public procedures
   * @see file://./../../../../packages/api/src/router/index.ts
   */
  "/api/trpc",
  "/api/trpc/main",
  "/api/trpc/chat",
  /**
   * Only Lessons shared by the creator are available at this endpoint
   */
  "/aila/:chatId/share",
  "/",
  "/legal/(.*)",
  /**
   * Sentry proxy endpoint
   */
  "/monitoring",
  "/sign-in(.*)",
  "/sign-up(.*)",
];

if (process.env.NODE_ENV === "development") {
  // This allows us to warm up the chat server with live reload
  // So we get something closer to the live experience
  // Without having to wait for each page to compile as we navigate
  publicRoutes.push("/api/chat");
  publicRoutes.push("/aila");
}

const isPublicRoute = createRouteMatcher(publicRoutes);

function conditionallyProtectRoute(
  auth: ClerkMiddlewareAuth,
  request: NextRequest,
) {
  const authObject = auth();
  sentrySetUser(authObject);

  if (!isPublicRoute(request)) {
    authObject.protect();
  }
}

export async function authMiddleware(
  request: NextRequest,
  event: NextFetchEvent,
): Promise<Response> {
  const configuredClerkMiddleware = clerkMiddleware(conditionallyProtectRoute);

  const response = await configuredClerkMiddleware(request, event);

  if (!response) {
    return NextResponse.next({ request });
  }

  return response;
}
