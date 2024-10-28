import { jsonrepair } from "jsonrepair";

import { type AilaServices } from "../../core/AilaServices";
import { tryWithErrorReporting } from "../../helpers/errorReporting";
import { Message } from "../chat";

export abstract class AilaPromptBuilder {
  protected _aila: AilaServices;

  constructor(aila: AilaServices) {
    this._aila = aila;
  }

  public abstract build(): Promise<string>;

  public reduceMessagesForPrompt(messages: Message[]): Message[] {
    return messages.map((m) => {
      if (m.role === "assistant") {
        const content = m.content;
        const newAssistantMessage: Message = {
          id: m.id,
          role: "assistant",
          content: content
            .split("␞")
            .map((r) => r.trim())
            .map((row) => {
              if (!row.includes("{")) {
                return row;
              }
              return tryWithErrorReporting(
                () => {
                  const toParse = jsonrepair(row);
                  const parsed = JSON.parse(toParse);

                  if (
                    ["state", "comment", "moderation", "action", "id"].includes(
                      parsed.type,
                    )
                  ) {
                    return null;
                  }
                  return row;
                },
                `Failed to parse row`,
                "info",
                {
                  category: "json",
                  message: row,
                },
              );
            })
            .filter((r) => r !== null)
            .filter((r) => r !== "")
            .join("␞\n"),
        };
        return newAssistantMessage;
      }
      return m;
    });
  }
}
