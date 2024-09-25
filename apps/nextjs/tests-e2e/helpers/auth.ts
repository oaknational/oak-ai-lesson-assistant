import { TestSupportRouter } from "@oakai/api/src/router/testSupport";
import { transformer } from "@oakai/api/transformer";
import { test, Page } from "@playwright/test";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { TEST_BASE_URL } from "../config/config";

const trpc = createTRPCProxyClient<TestSupportRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: `${TEST_BASE_URL}/api/trpc/test-support`,
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
