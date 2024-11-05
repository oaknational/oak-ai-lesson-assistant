import { Aila } from "@oakai/aila/src/core/Aila";
import { AilaPlugin } from "@oakai/aila/src/core/plugins";

const cliPlugin: AilaPlugin = {
  onStreamError: async (error, { aila, enqueue }) => {
    // ...
    throw error;
  },
  onToxicModeration: async (moderation, { aila, enqueue }) => {
    // ...
  },
  onBackgroundWork: (promise) => {
    // ...
  },
};

const aila = new Aila({
  chat: { id: "my chat id", userId: undefined },
  plugins: [cliPlugin],
});
console.log("Hello from Next.js CLI!");
console.log(aila.chatId);
