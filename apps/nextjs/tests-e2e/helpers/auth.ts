import { TestSupportRouter } from "@oakai/api/src/router/testSupport";
import { transformer } from "@oakai/api/transformer";
import { test, Page } from "@playwright/test";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { TEST_BASE_URL } from "../config/config";

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 2525}`; // dev SSR should use localhost
};

const trpc = createTRPCProxyClient<TestSupportRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc/test-support`,
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
