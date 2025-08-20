import { isTruthy } from "remeda";

import type { GenericPromptAgentPrompt } from "../schema";
import { basedOnContentPromptPart } from "../shared-prompt-parts/basedOnContent.part";
import { currentSectionValuePromptPart } from "../shared-prompt-parts/currentSectionValue.part";
import { exemplarContentPromptPart } from "../shared-prompt-parts/exemplarContent.part";
import { messageHistoryPromptPart } from "../shared-prompt-parts/messageHistory.part";
import { userMessagePromptPart } from "../shared-prompt-parts/userMessage.part";
import type { SectionPromptAgentProps } from "../types";

export function sectionToGenericAgent<T>({
  responseSchema,
  instructions,
  messages,
  exemplarContent,
  basedOnContent,
  currentValue,
  contentToString,
  state,
  extraInputFromState,
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
      ...(extraInputFromState ? extraInputFromState(state) : []),
    ].filter(isTruthy),
  };
}
