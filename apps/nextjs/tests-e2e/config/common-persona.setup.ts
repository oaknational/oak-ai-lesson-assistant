import { Page, test as setup } from "@playwright/test";
import path from "path";

import { prepareUser } from "../helpers/auth";
import { bypassVercelProtection } from "../helpers/vercel";
import { TEST_BASE_URL } from "./config";

const authFile = path.join(__dirname, "../.auth/common-user.json");

const setTestChatIdCookie = async (page: Page, chatId: string | undefined) => {
  await page.context().addCookies([
    {
      url: TEST_BASE_URL,
      name: "typicalChatId",
      value: chatId || "",
    },
  ]);
};

setup("prepare common user with 'typical' variant", async ({ page }) => {
  await bypassVercelProtection(page);
  await page.context().clearCookies();

  const login = await prepareUser(page, "typical");

  await setTestChatIdCookie(page, login.chatId);
  await page.context().storageState({ path: authFile });
});
