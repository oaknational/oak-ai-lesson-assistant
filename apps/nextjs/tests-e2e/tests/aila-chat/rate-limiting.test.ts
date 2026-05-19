import { expect, test } from "@playwright/test";

import { getAilaUrl } from "@/utils/getAilaUrl";

import { TEST_BASE_URL } from "../../config/config";
import { prepareUser } from "../../helpers/auth";
import { bypassVercelProtection } from "../../helpers/vercel";
import {
  applyLlmFixtures,
  continueChat,
  performAndWaitForGeneration,
} from "./helpers";

const GENERATION_TIMEOUT = 30000;

test("User is restricted after message rate limit is reached", async ({
  page,
}) => {
  test.setTimeout(GENERATION_TIMEOUT * 2);

  await test.step("Setup", async () => {
    await bypassVercelProtection(page);
    await prepareUser(page, "nearly-rate-limited");

    await page.goto(`${TEST_BASE_URL}${getAilaUrl("lesson")}`);
    await expect(page.getByTestId("chat-h1")).toBeInViewport();
  });

  const { setFixture } = await applyLlmFixtures(page, "replay");

  await test.step("Fill in the chat box", async () => {
    const textbox = page.getByTestId("chat-input");

    const message =
      "Create a KS1 lesson on the end of Roman Britain. Ask a question for each quiz and cycle";
    await textbox.fill(message);
    await expect(textbox).toHaveValue(message);

    setFixture("roman-britain-1");
  });

  await test.step("Send first message", async () => {
    await performAndWaitForGeneration(page, GENERATION_TIMEOUT, async () => {
      await Promise.all([
        page.getByTestId("send-message").click(),
        page.waitForURL(/\/aila\/.+/),
      ]);
    });

    await expect(
      page.getByTestId("chat-message-wrapper-error"),
    ).not.toBeAttached();
    await expect(page.getByTestId("chat-message-wrapper-aila")).toContainText(
      "Are the learning outcome and learning cycles appropriate for your pupils?",
      { timeout: 10000 },
    );
  });

  await test.step("Send second message", async () => {
    await performAndWaitForGeneration(page, 10000, async () => {
      await continueChat(page);
    });

    const errorMessage = page.getByTestId("chat-message-wrapper-error");
    await expect(errorMessage).toContainText(
      "Unfortunately you’ve exceeded your fair usage limit",
    );
  });

  await test.step("Send third message", async () => {
    await performAndWaitForGeneration(page, 10000, async () => {
      await continueChat(page);
    });

    await expect(
      page.getByTestId("chat-message-wrapper-error").last(),
    ).toContainText("Unfortunately you’ve exceeded your fair usage limit", {});
  });
});
