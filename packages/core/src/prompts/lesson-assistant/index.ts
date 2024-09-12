import crypto from "crypto";

import {
  americanToBritish,
  basedOn,
  body,
  context,
  endingTheInteraction,
  generateResponse,
  protocol,
  rag,
  schema,
  signOff,
  task,
  interactingWithTheUser,
} from "./parts";
import { currentLessonPlan } from "./parts/currentLessonPlan";
import { languageAndVoice } from "./parts/languageAndVoice";
import { lessonComplete } from "./parts/lessonComplete";

export interface TemplateProps {
  subject?: string;
  keyStage?: string;
  topic?: string;
  relevantLessonPlans?: string;
  currentLessonPlan?: string;
  summaries?: string;
  lessonTitle?: string;
  responseMode?: "interactive" | "generate";
  baseLessonPlan?: string;
  useRag?: boolean;
  americanisms?: object[];
  lessonPlanJsonSchema: string;
  llmResponseJsonSchema: string;
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
    currentLessonPlan,
    task,
    props.useRag ? rag : undefined,
    props.baseLessonPlan ? basedOn : undefined,
    props.responseMode === "interactive" ? interactingWithTheUser : undefined,
    body,
    schema,
    americanToBritishSection,
    endingTheInteractionSection,
    response,
    languageAndVoice,
    props.responseMode === "interactive" ? lessonComplete : undefined,
    signOff,
  ];

  return parts.filter((part): part is TemplatePart => part !== undefined);
};

export const template = function (props: TemplateProps) {
  const parts = getPromptParts(props);
  return parts.map((part) => part(props)).join("\n\n");
};

export const generatePromptPartsHash = (props: TemplateProps): string => {
  const parts = getPromptParts(props);
  const partsString = parts.map((part) => part.toString()).join("");
  const hash = crypto.createHash("md5").update(partsString).digest("hex");
  return `${props.responseMode}-${props.useRag ? "rag" : "noRag"}-${props.baseLessonPlan ? "basedOn" : "notBasedOn"}-${hash}`;
};
