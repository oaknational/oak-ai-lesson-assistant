import { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaPlugin } from "@oakai/aila/src/core/plugins";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("aila");

const cliPlugin: AilaPlugin = {
  onStreamError: (error) => {
    // ...
    throw error;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToxicModeration: async (moderation, { aila, enqueue }) => {
    // ...
  },
  onBackgroundWork: () => {
    // ...
  },
};

const aila = new Aila({
  chat: { id: "my chat id", userId: undefined },
  plugins: [cliPlugin],
});
log.info("Hello from Next.js CLI!");
log.info(aila.chatId);
