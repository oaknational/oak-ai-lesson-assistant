import type { ChatMessage } from "../../types";
import { createPromptPartMessageFn } from "./_createPromptPart";

export const messageHistoryPromptPart = createPromptPartMessageFn<
  ChatMessage[]
>({
  heading: "MESSAGE HISTORY",
  description: (messages) =>
    messages.length > 1
      ? "These are the previous messages in the current conversation with the user."
      : "There have been no previous messages. See user's message below, which is the start of the interaction.",
  contentToString: (messages) =>
    messages
      .slice(0, messages.length - 1)
      .map((msg) => `- ${msg.role}: ${msg.content}`)
      .join("\n"),
});
