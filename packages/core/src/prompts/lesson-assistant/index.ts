import crypto from "crypto";

import type { LooseLessonPlan } from "../../../../aila/src/protocol/schema";
import {
  americanToBritish,
  basedOn,
  body,
  context,
  endingTheInteraction,
  generateResponse,
  interactingWithTheUser,
  languageInstruction,
  protocol,
  rag,
  schema,
  signOff,
  task,
} from "./parts";
import { currentLessonPlan } from "./parts/currentLessonPlan";
import { languageAndVoice } from "./parts/languageAndVoice";
import { lessonComplete } from "./parts/lessonComplete";
import { promptingTheUser } from "./parts/promptingTheUser";

export interface TemplateProps {
  relevantLessonPlans?: string;
  lessonPlan: LooseLessonPlan;
  summaries?: string;
  responseMode?: "interactive" | "generate";
  baseLessonPlan?: string;
  useRag?: boolean;
  americanisms?: object[];
  lessonPlanJsonSchema: string;
  llmResponseJsonSchema: string;
  isUsingStructuredOutput: boolean;
  language?: string;
}

type TemplatePart = (props: TemplateProps) => string;

export const getPromptParts = (props: TemplateProps): TemplatePart[] => {
  let response: TemplatePart | undefined;
  switch (props.responseMode) {
    case "interactive":
      response = protocol;
      break;
    case "generate":
      response = generateResponse;
      break;
  }

  const americanToBritishSection =
    props.responseMode === "interactive" &&
    props.americanisms &&
    props.americanisms.length > 0
      ? americanToBritish
      : undefined;

  const endingTheInteractionSection =
    props.responseMode === "interactive" ? endingTheInteraction : undefined;

  const parts: (TemplatePart | undefined)[] = [
    context,
    task,
    props.responseMode === "interactive" ? interactingWithTheUser : undefined,
    props.responseMode === "interactive" ? lessonComplete : undefined,
    props.responseMode === "interactive"
      ? endingTheInteractionSection
      : undefined,
    body,
    currentLessonPlan,
    props.useRag ? rag : undefined,
    props.baseLessonPlan ? basedOn : undefined,
    americanToBritishSection,
    languageAndVoice,
    props.isUsingStructuredOutput ? undefined : schema,
    response,
    props.responseMode === "interactive" ? promptingTheUser : undefined,
    signOff,
    languageInstruction,
  ];

  return parts.filter((part): part is TemplatePart => part !== undefined);
};

export const template = function (props: TemplateProps) {
  const parts = getPromptParts(props);

  // Debug logging for language parameter
  if (props.language === "ukrainian") {
    console.log("=== TEMPLATE PARTS DEBUG FOR UKRAINIAN ===");
    console.log(`Template has ${parts.length} parts`);
    console.log(`Language parameter: "${props.language}"`);

    // Check if languageInstruction is included in parts
    const languageInstructionIndex = parts.findIndex(
      (part) =>
        part.name === "languageInstruction" ||
        part.toString().includes("languageInstruction"),
    );

    console.log(
      `Language instruction included in parts: ${languageInstructionIndex !== -1 ? "YES" : "NO"}, position: ${languageInstructionIndex}`,
    );

    // Show function names of all parts
    console.log("Parts included:");
    parts.forEach((part, index) => {
      const partName = part.name || "unnamed";
      console.log(`  ${index}: ${partName}`);

      // If this is the language instruction part, let's see what it returns
      if (
        partName === "languageInstruction" ||
        part.toString().includes("languageInstruction")
      ) {
        const content = part(props);
        console.log(`  Content length: ${content.length} characters`);
        console.log(`  First 100 chars: ${content.substring(0, 100)}...`);
      }
    });

    console.log("=== END TEMPLATE PARTS DEBUG FOR UKRAINIAN ===");
  }

  return parts.map((part) => part(props)).join("\n\n");
};

export const generatePromptPartsHash = (props: TemplateProps): string => {
  const parts = getPromptParts(props);
  const partsString = parts.map((part) => part.toString()).join("");
  const hash = crypto.createHash("md5").update(partsString).digest("hex");
  return `${props.responseMode}-${props.useRag ? "rag" : "noRag"}-${
    props.baseLessonPlan ? "basedOn" : "notBasedOn"
  }-${hash}`;
};
