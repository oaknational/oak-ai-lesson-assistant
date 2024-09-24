import { TestSupportRouter } from "@oakai/api/src/router/testSupport";
import { transformer } from "@oakai/api/transformer";
import { test, expect, Page } from "@playwright/test";
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

async function prepareUser(page: Page) {
  const login = await trpc.prepareUser.mutate({
    variant: "demo",
  });
  console.log("prepareUser", login);

  // TODO: ripped from auth setup for now
  await page.goto(`${TEST_BASE_URL}/sign-in`);
  await expect(page.locator("h1")).toContainText(
    "Sign in to Oak National Academy",
  );
  await page.waitForSelector(".cl-signIn-root", { state: "attached" });
  await page.locator("input[name=identifier]").fill(login.email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("link", { name: "Use another method", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Sign in with your password" })
    .click();
  await page.locator("input[name=password]").fill(login.password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

test.describe("Demo accounts", () => {
  test("should see the demo banner", async ({ page }) => {
    await prepareUser(page);

    await page.goto(`${TEST_BASE_URL}/aila`);
    await expect(page.getByTestId("demo-banner")).toBeVisible();
    await expect(page.getByTestId("demo-banner")).toContainText(
      "Create 3 lessons per month",
    );
  });
});
