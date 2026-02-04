import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import { isTruthy } from "remeda";

import type { GenericPromptAgent } from "../schema";
import type { SectionPromptAgentProps } from "../types";
import { identityAndVoice } from "./sectionAgents/shared/identityAndVoice";
import {
  getVoiceDefinitions,
  getVoicePrompt,
} from "./sectionAgents/shared/voices";
import { basedOnContentPromptPart } from "./sharedPromptParts/basedOnContent.part";
import { currentDocumentPromptPart } from "./sharedPromptParts/currentDocument.part";
import { currentSectionValuePromptPart } from "./sharedPromptParts/currentSectionValue.part";
import { exemplarContentPromptPart } from "./sharedPromptParts/exemplarContent.part";
import { messageHistoryPromptPart } from "./sharedPromptParts/messageHistory.part";
import { userMessagePromptPart } from "./sharedPromptParts/userMessage.part";

export function sectionToGenericPromptAgent<SectionValueType>(
  {
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
  }: SectionPromptAgentProps<SectionValueType>,
  modelParams: Omit<
    ResponseCreateParamsNonStreaming,
    "input" | "text" | "stream"
  >,
): GenericPromptAgent<SectionValueType> {
  voices = voices.includes(defaultVoice) ? voices : [defaultVoice, ...voices];

  return {
    responseSchema: responseSchema,
    input: [
      {
        role: "developer" as const,
        content: identityAndVoice,
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
      {
        role: "developer" as const,
        content: currentDocumentPromptPart(ctx.currentTurn.document),
      },
      currentValue && {
        role: "developer" as const,
        content: currentSectionValuePromptPart(currentValue, contentToString),
      },
      {
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
    modelParams,
  };
}
