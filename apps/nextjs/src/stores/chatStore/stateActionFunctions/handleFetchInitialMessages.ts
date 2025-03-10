import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import invariant from "tiny-invariant";

import type { TrpcUtils } from "@/utils/trpc";

import type { ChatSetter, ChatGetter, AiMessage } from "../types";

const log = aiLogger("chat:store");

function isValidMessageRole(role: unknown): role is AiMessage["role"] {
  return (
    typeof role === "string" &&
    ["system", "assistant", "user", "data"].includes(role)
  );
}

export const handleFetchInitialMessages =
  (set: ChatSetter, get: ChatGetter, trpc: TrpcUtils) => async () => {
    log.info("Fetching initial messages");
    try {
      const id = get().id;
      const result = await trpc.client.chat.appSessions.getChat.query({ id });
      invariant(result, "result should not be null");
      const { messages, startingMessage } = result;

      const initialMessages = messages.filter((m) =>
        isValidMessageRole(m.role),
      ) as AiMessage[];

      set({ initialMessages });

      if (startingMessage) {
        log.info("Appending starting message");
        get().actions.append(startingMessage);
      }
      log.info(`Set initial messages for AI SDK from DB`);
    } catch (err) {
      log.error("Error fetching initial messages", err);
      Sentry.captureException(err);
    }
  };
