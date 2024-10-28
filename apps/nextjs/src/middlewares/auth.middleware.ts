import {
  type ClerkMiddlewareAuth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { aiLogger } from "@oakai/logger";
import type { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { sentrySetUser } from "@/lib/sentry/sentrySetUser";

const log = aiLogger("middleware:auth");

declare global {
  interface CustomJwtSessionClaims {
    labs: {
      isDemoUser: boolean | null;
      isOnboarded: boolean | null;
    };
  }
}

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
if (
  process.env.NODE_ENV === "development" ||
  process.env.VERCEL_ENV === "preview"
) {
  publicRoutes.push("/api/trpc/test-support/(.*)", "/test-support/(.*)");
}

const isPublicRoute = createRouteMatcher(publicRoutes);

// This allows us to warm up the chat server with live reload
// So we get something closer to the live experience
// Without having to wait for each page to compile as we navigate
const isPreloadableRoute = createRouteMatcher([
  ...publicRoutes,
  "/api/chat",
  "/aila",
]);

const isOnboardingRoute = createRouteMatcher([
  "/onboarding",
  "/sign-in",
  // NOTE: Be careful that this request doesn't batch as it will change the path
  "/api/trpc/main/auth.setDemoStatus",
  "/api/trpc/main/auth.acceptTerms",
  "/api/trpc/main",
]);

const isHomepage = createRouteMatcher(["/"]);

const shouldInterceptRouteForOnboarding = (req: NextRequest) => {
  if (isOnboardingRoute(req)) {
    return false;
  }
  if (isHomepage(req)) {
    return true;
  }
  if (isPublicRoute(req)) {
    return false;
  }
  return true;
};

const needsToCompleteOnboarding = (sessionClaims: CustomJwtSessionClaims) => {
  const labs = sessionClaims.labs;
  return !labs.isOnboarded || labs.isDemoUser === null;
};

const logger = (request: NextRequest) => (message: string) => {
  log.info(`${request.url} ${message}`);
};

function conditionallyProtectRoute(
  auth: ClerkMiddlewareAuth,
  req: NextRequest,
) {
  const authObject = auth();
  const { userId, redirectToSignIn, sessionClaims } = authObject;
  const log = logger(req);

  sentrySetUser(authObject);

  if (userId && needsToCompleteOnboarding(sessionClaims)) {
    if (shouldInterceptRouteForOnboarding(req)) {
      log("Incomplete onboarding: REDIRECT");
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  if (isPublicRoute(req)) {
    log("Public route: ALLOW");
    return;
  }

  if (
    process.env.NODE_ENV === "development" &&
    req.headers.get("x-dev-preload")
  ) {
    if (isPreloadableRoute(req)) {
      log("Dev preload route: ALLOW");
      return;
    }
  }

  if (!userId) {
    log("Protected route: REDIRECT");
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  log("Protected route: ALLOW");
}

export async function authMiddleware(
  request: NextRequest,
  event: NextFetchEvent,
): Promise<Response> {
  const configuredClerkMiddleware = clerkMiddleware(conditionallyProtectRoute);

  try {
    const response = await configuredClerkMiddleware(request, event);
    if (response) {
      return response;
    }
  } catch (error) {
    log.error({ event: "middleware.auth.error", error });
    throw new Error("Error in authMiddleware", { cause: error });
  }

  return NextResponse.next({ request });
}
