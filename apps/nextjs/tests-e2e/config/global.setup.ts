import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

<<<<<<< HEAD
setup("global setup", async () => {
=======
setup("global setup", async ({}) => {
>>>>>>> 1cfb186 (Update @clerk/testing to 1.3.7 to use sign-in helper)
  await clerkSetup();
});
