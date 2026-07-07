import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import { isTruthy } from "remeda";

import type { GenericPromptAgent } from "../schema";
import type { SectionPromptAgentProps } from "../types";
import { staticPromptParts } from "./sectionAgents/shared/staticPromptParts";
import { basedOnContentPromptPart } from "./sharedPromptParts/basedOnContent.part";
import { currentDocumentPromptPart } from "./sharedPromptParts/currentDocument.part";
import { currentSectionValuePromptPart } from "./sharedPromptParts/currentSectionValue.part";
import { exemplarContentPromptPart } from "./sharedPromptParts/exemplarContent.part";
import { messageHistoryPromptPart } from "./sharedPromptParts/messageHistory.part";
import { sectionInstructionsPromptPart } from "./sharedPromptParts/sectionInstructions.part";
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
  return {
    responseSchema: responseSchema,
    input: [
      ...staticPromptParts({
        includeIdentity: true,
        instructions,
        voices,
        defaultVoice,
      }),
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
      ctx.currentTurn.currentStep?.sectionInstructions && {
        role: "developer" as const,
        content: sectionInstructionsPromptPart(
          ctx.currentTurn.currentStep.sectionInstructions,
        ),
      },
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
