import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

import { warmVercelPreview } from "../helpers/vercel";

setup("global setup", async ({ page }) => {
  await clerkSetup();
  await warmVercelPreview(page);
});
