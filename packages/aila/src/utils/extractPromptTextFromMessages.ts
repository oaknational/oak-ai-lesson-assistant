import { z } from "zod";

/**
 * This function extracts the prompt text from messages.
 * It checks if the message is from the user or assistant.
 * If it's from the assistant, it tries to parse the content as JSON
 * and extract the prompt value.
 *
 * The idea is that it returns a list of messages which reads much
 * more like an exchange between a user and an assistant, without
 * all the JSON patch protocol etc.
 *
 * @param messages - Array of messages containing role and content
 * @returns Array of messages with prompt text extracted
 */
export function extractPromptTextFromMessages(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
) {
  return messages.map((m) => {
    if (m.role === "user") {
      // User messages are always just text
      return m;
    }

    // Check if message has message.content.prompt.value
    const parseResult = z
      .object({ prompt: z.object({ value: z.string() }) })
      .safeParse(JSON.parse(m.content));

    if (parseResult.success) {
      return {
        ...m,
        content: parseResult.data.prompt.value,
      };
    }

    return m;
  });
}
