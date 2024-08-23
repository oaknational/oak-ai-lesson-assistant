import { Aila } from "@oakai/aila";
import { AilaPlugin } from "@oakai/aila/src/core/plugins";

const cliPlugin: AilaPlugin = {
  onStreamError: async (error, { aila, enqueue }) => {
    // ...
    throw error;
  },
  onToxicModeration: async (moderation, { aila, enqueue }) => {
    // ...
  },
};

const aila = new Aila({
  chat: { id: "my chat id", userId: undefined },
  plugins: [cliPlugin],
});
console.log("Hello from Next.js CLI!");
console.log(aila.chatId);
