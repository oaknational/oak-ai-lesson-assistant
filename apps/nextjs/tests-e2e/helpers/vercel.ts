import { Page } from "@playwright/test";

import {
  TEST_BASE_URL,
  VERCEL_AUTOMATION_BYPASS_SECRET,
} from "../config/config";

export async function bypassVercelProtection(page: Page) {
  if (!VERCEL_AUTOMATION_BYPASS_SECRET) {
    return;
  }
  await page.route(`${TEST_BASE_URL}/**/*`, async (route, request) => {
    if (!VERCEL_AUTOMATION_BYPASS_SECRET) {
      return;
    }
    // Override headers
    const headers = {
      ...request.headers(),
      "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET,
    };
    await route.continue({ headers });
  });
}
