import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * This file replicates helpers provided by @clerk/testing
 *
 * As of v1.3.7, @clerk/testing uses `waitForFunction` which triggers out unsafe-eval CSP rule, so we can't use it as-is
 * See https://github.com/clerk/javascript/blob/1a1247ce08b8a3e6d4435548a344cd859cf3b007/packages/testing/src/playwright/helpers.ts#L79-L82
 */

// A version of `waitForFunction` that doesn't trigger unsafe-eval CSP
export async function cspSafeWaitForFunction(page: Page, fn: () => unknown) {
  await expect
    .poll(async () => await page.evaluate(fn), { intervals: [50] })
    .toBeTruthy();
}

// A slim version of @clerk/testing's `signInHelper` function
export const clerkSignInHelper = async (identifier: string) => {
  try {
    const w = window;
    if (!w.Clerk.client) {
      return;
    }
    const signIn = w.Clerk.client.signIn;

    if (!identifier.includes("+clerk_test")) {
      throw new Error(
        `Email should be a test email.\n
      Any email with the +clerk_test subaddress is a test email address.\n
      Learn more here: https://clerk.com/docs/testing/test-emails-and-phones#email-addresses`,
      );
    }

    const { supportedFirstFactors } = await signIn.create({ identifier });
    const codeFactor = supportedFirstFactors?.find(
      (factor) => factor.strategy === "email_code",
    );
    if (codeFactor?.strategy === "email_code") {
      const prepareParams = {
        strategy: "email_code",
        emailAddressId: codeFactor.emailAddressId,
      } as const;

      await signIn.prepareFirstFactor(prepareParams);
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: "424242",
      });

      if (signInAttempt.status === "complete") {
        await w.Clerk.setActive({
          session: signInAttempt.createdSessionId,
        });
      } else {
        throw new Error(`Status is ${signInAttempt.status}`);
      }
    } else {
      throw new Error("email_code is not enabled.");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Clerk: Failed to sign in: ${message}`);
  }
};
