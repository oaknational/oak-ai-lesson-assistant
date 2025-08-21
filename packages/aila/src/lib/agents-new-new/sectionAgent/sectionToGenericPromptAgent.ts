import { isTruthy } from "remeda";

import type { GenericPromptAgentPrompt } from "../schema";
import { basedOnContentPromptPart } from "../sharedPromptParts/basedOnContent.part";
import { currentSectionValuePromptPart } from "../sharedPromptParts/currentSectionValue.part";
import { exemplarContentPromptPart } from "../sharedPromptParts/exemplarContent.part";
import { messageHistoryPromptPart } from "../sharedPromptParts/messageHistory.part";
import { userMessagePromptPart } from "../sharedPromptParts/userMessage.part";
import type { SectionPromptAgentProps } from "../types";

export function sectionToGenericAgent<T>({
  responseSchema,
  instructions,
  messages,
  exemplarContent,
  basedOnContent,
  currentValue,
  contentToString,
  ctx,
  extraInputFromCtx,
}: SectionPromptAgentProps<T>): GenericPromptAgentPrompt<T> {
  return {
    responseSchema: responseSchema,
    input: [
      {
        role: "developer" as const,
        content: instructions,
      },
      currentValue && {
        role: "user" as const,
        content: currentSectionValuePromptPart(currentValue, contentToString),
      },
      {
        role: "user" as const,
        content: exemplarContentPromptPart(
          exemplarContent ?? [],
          contentToString,
        ),
      },
      basedOnContent && {
        role: "user" as const,
        content: basedOnContentPromptPart(basedOnContent, contentToString),
      },
      {
        role: "user" as const,
        content: messageHistoryPromptPart(messages),
      },
      {
        role: "user" as const,
        content: userMessagePromptPart(messages),
      },
      ...(extraInputFromCtx ? extraInputFromCtx(ctx) : []),
    ].filter(isTruthy),
  };
}
