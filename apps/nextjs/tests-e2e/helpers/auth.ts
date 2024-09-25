import { TestSupportRouter } from "@oakai/api/src/router/testSupport";
import { transformer } from "@oakai/api/transformer";
import { test, Page } from "@playwright/test";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";

import {
  TEST_BASE_URL,
  VERCEL_AUTOMATION_BYPASS_SECRET,
} from "../config/config";

const trpc = createTRPCProxyClient<TestSupportRouter>({
  transformer,
  links: [
    loggerLink(),
    httpBatchLink({
      url: `${TEST_BASE_URL}/api/trpc/test-support`,
      headers: {
        "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET,
      },
    }),
  ],
});

export async function prepareUser(page: Page, variant: "typical" | "demo") {
  await test.step("Prepare user", async () => {
    const login = await test.step("tRPC.prepareUser", async () => {
      return await trpc.prepareUser.mutate({ variant });
    });

    await page.goto(
      `${TEST_BASE_URL}/test-support/sign-in?token=${login.signInToken}`,
    );
    await page.waitForSelector(".success");
  });
}
