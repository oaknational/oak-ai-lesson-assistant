import { isTruthy } from "remeda";

import type { GenericPromptAgent } from "../schema";
import type { SectionPromptAgentProps } from "../types";
import { sectionAgentIdentity } from "./sectionAgents/shared/sectionAgentIdentity";
import {
  getVoiceDefinitions,
  getVoicePrompt,
} from "./sectionAgents/shared/voices";
import { basedOnContentPromptPart } from "./sharedPromptParts/basedOnContent.part";
import { currentSectionValuePromptPart } from "./sharedPromptParts/currentSectionValue.part";
import { exemplarContentPromptPart } from "./sharedPromptParts/exemplarContent.part";
import { messageHistoryPromptPart } from "./sharedPromptParts/messageHistory.part";
import { userMessagePromptPart } from "./sharedPromptParts/userMessage.part";

export function sectionToGenericPromptAgent<SectionValueType>({
  responseSchema,
  instructions,
  messages,
  exemplarContent,
  basedOnContent,
  currentValue,
  contentToString,
  ctx,
  extraInputFromCtx,
  defaultVoice = "AILA_TO_TEACHER",
  voices = [],
}: SectionPromptAgentProps<SectionValueType>): GenericPromptAgent<SectionValueType> {
  voices = voices.includes(defaultVoice) ? voices : [defaultVoice, ...voices];

  return {
    responseSchema: responseSchema,
    input: [
      {
        role: "developer" as const,
        content: sectionAgentIdentity,
      },
      {
        role: "developer" as const,
        content: instructions,
      },
      voices.length > 0 && {
        role: "developer" as const,
        content: getVoiceDefinitions(voices),
      },
      defaultVoice && {
        role: "developer" as const,
        content: getVoicePrompt(defaultVoice),
      },
      currentValue && {
        role: "developer" as const,
        content: currentSectionValuePromptPart(currentValue, contentToString),
      },
      exemplarContent?.length && {
        role: "developer" as const,
        content: exemplarContentPromptPart(
          exemplarContent ?? [],
          contentToString,
        ),
      },
      basedOnContent && {
        role: "developer" as const,
        content: basedOnContentPromptPart(basedOnContent, contentToString),
      },
      ...(extraInputFromCtx ? extraInputFromCtx(ctx) : []),
      {
        role: "developer" as const,
        content: messageHistoryPromptPart(messages),
      },
      {
        role: "user" as const,
        content: userMessagePromptPart(messages),
      },
    ].filter(isTruthy),
  };
}
