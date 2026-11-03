import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import invariant from "tiny-invariant";

import type { GetStore } from "@/stores/AilaStoresProvider";
import type { TrpcUtils } from "@/utils/trpc";

import type { AiMessage, ChatGetter, ChatSetter } from "../types";

const log = aiLogger("chat:store");

function isValidMessageRole(role: unknown): role is AiMessage["role"] {
  return (
    typeof role === "string" &&
    ["system", "assistant", "user", "data"].includes(role)
  );
}

export const handleFetchInitialMessages =
  (set: ChatSetter, get: ChatGetter, getStore: GetStore, trpc: TrpcUtils) =>
  async () => {
    if (get().initialMessages !== null) {
      return;
    }
    log.info("Fetching initial messages");
    try {
      const id = get().id;
      const result = await trpc.client.chat.appSessions.getChat.query({ id });
      invariant(result, "result should not be null");
      const { messages, startingMessage } = result;

      // Another request may have finished while this one was pending. Never
      // replace a live conversation or send its starting message twice.
      if (get().initialMessages !== null) {
        return;
      }

      const initialMessages = messages.filter((m) =>
        isValidMessageRole(m.role),
      ) as AiMessage[];

      // Set the SDK's history before enabling submission or sending the
      // starting message. A React effect would run too late for that send.
      get().aiSdkActions.initializeMessages(initialMessages);
      set({ initialMessages });

      if (startingMessage) {
        log.info("Appending starting message");
        getStore("lessonPlanTracking").actions.clickedStart(startingMessage);
        get().actions.append({ type: "message", content: startingMessage });
      }
      log.info(`Set initial messages for AI SDK from DB`);
    } catch (err) {
      log.error("Error fetching initial messages", err);
      Sentry.captureException(err);

      // Still let the user send. The chat endpoint loads the history itself
      if (get().initialMessages === null) {
        get().aiSdkActions.initializeMessages([]);
        set({ initialMessages: [] });
      }
    }
  };
