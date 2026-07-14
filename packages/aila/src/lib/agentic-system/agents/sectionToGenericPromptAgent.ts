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
import { sectionInstructionsPromptPart } from "./sharedPromptParts/sectionInstructions.part";
import { userMessagePromptPart } from "./sharedPromptParts/userMessage.part";

export function sectionToGenericPromptAgent<SectionValueType>(
  {
    responseSchema,
    id,
    instructions,
    templateText,
    promptTemplateId,
    promptInputs,
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
  const resolvedVoices = voices.includes(defaultVoice)
    ? voices
    : [defaultVoice, ...voices];

  // Identity and voice first (most stable → best prompt-cache prefix), then
  // instructions; shared between the runtime prompt and the stored template.
  const voicePrefix = [
    { role: "developer" as const, content: identityAndVoice },
    resolvedVoices.length > 0 && {
      role: "developer" as const,
      content: getVoiceDefinitions(resolvedVoices),
    },
    defaultVoice && {
      role: "developer" as const,
      content: getVoicePrompt(defaultVoice),
    },
  ].filter(isTruthy);

  const staticParts = [
    ...voicePrefix,
    { role: "developer" as const, content: instructions },
  ];

  // Stored template prefers `templateText` (version-stable) over the runtime
  // instructions.
  const promptTemplate = [
    ...voicePrefix.map((part) => part.content),
    templateText ?? instructions,
  ].join("\n\n");

  return {
    id,
    promptTemplateId,
    promptTemplate,
    promptInputs,
    responseSchema: responseSchema,
    input: [
      ...staticParts,
      {
        role: "developer" as const,
        content: currentDocumentPromptPart(ctx.currentTurn.document),
      },
      currentValue && {
        role: "developer" as const,
        content: currentSectionValuePromptPart(currentValue, contentToString),
      },
      exemplarContent &&
        exemplarContent.length > 0 && {
          role: "developer" as const,
          content: exemplarContentPromptPart(exemplarContent, contentToString),
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
