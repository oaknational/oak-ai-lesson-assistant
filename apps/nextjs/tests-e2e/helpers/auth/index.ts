import type { TestSupportRouter } from "@oakai/api/src/router/testSupport";
import { transformer } from "@oakai/api/transformer";
import { aiLogger } from "@oakai/logger";

import { setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";
import { test } from "@playwright/test";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";

import {
  TEST_BASE_URL,
  VERCEL_AUTOMATION_BYPASS_SECRET,
} from "../../config/config";
import { clerkSignInHelper, cspSafeWaitForFunction } from "./clerkHelpers";

const logger = aiLogger("testing");

const trpc = createTRPCProxyClient<TestSupportRouter>({
  transformer,
  links: [
    loggerLink({ enabled: () => process.env.NODE_ENV === "development" }),
    httpBatchLink({
      url: `${TEST_BASE_URL}/api/trpc/test-support`,
      headers: {
        "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET,
      },
    }),
  ],
});

export async function prepareUser(
  page: Page,
  persona:
    | "typical"
    | "demo"
    | "nearly-banned"
    | "modify-lesson-plan"
    | "nearly-rate-limited"
    | "sharing-chat"
    | "needs-onboarding"
    | "needs-demo-status",
) {
  return await test.step("Prepare user", async () => {
    const [login] = await Promise.all([
      test.step("tRPC.prepareUser", async () => {
        return await trpc.prepareUser.mutate({ persona });
      }),
      page.goto(`${TEST_BASE_URL}/test-support/clerk`),
    ]);

    await test.step("clerk.signIn", async () => {
      await setupClerkTestingToken({ page });

      await cspSafeWaitForFunction(page, () => window.Clerk?.loaded);
      await page.evaluate(clerkSignInHelper, login.email);
    });

    await test.step("Accept cookie consent", async () => {
      try {
        await page.getByTestId("cookie-banner-accept").click();
      } catch (e) {
        logger.error("No cookie banner", e);
      }
    });

    return login;
  });
}
