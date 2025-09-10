import type { ChatMessage } from "../../types";
import { createPromptPartMessageFn } from "./_createPromptPart";

export const userMessagePromptPart = createPromptPartMessageFn<ChatMessage[]>({
  heading: "USER's MESSAGE",
  description: () =>
    "This is the most recent message from the user that we've been attempting to process.",
  contentToString: (messages) => messages[messages.length - 1]?.content ?? "",
});
