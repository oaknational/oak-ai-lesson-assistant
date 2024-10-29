import z from "zod";

import type { TemplateProps} from ".";
import { getPromptParts } from ".";
import type { OakPromptDefinition, OakPromptVariant } from "../types";

export const inputSchema = z.object({});

export const outputSchema = z.object({});

const generatePromptParts = (
  props: TemplateProps,
  slug: string,
): OakPromptVariant => {
  const parts = getPromptParts(props);
  return {
    slug,
    parts: {
      body: JSON.stringify(parts.map((part) => part(props))),
      context: "",
      output: "",
      task: "",
    },
  };
};

export const generateAilaPromptVersionVariantSlug = (
  responseMode: string,
  basedOn: boolean,
  useRag: boolean,
): string => {
  return `${responseMode}-${basedOn ? "basedOn" : "notBasedOn"}-${useRag ? "rag" : "noRag"}`;
};

const variantConfigs = [
  { responseMode: "interactive", basedOn: true, useRag: true },
  { responseMode: "interactive", basedOn: true, useRag: false },
  { responseMode: "interactive", basedOn: false, useRag: true },
  { responseMode: "interactive", basedOn: false, useRag: false },
  { responseMode: "generate", basedOn: true, useRag: true },
  { responseMode: "generate", basedOn: true, useRag: false },
  { responseMode: "generate", basedOn: false, useRag: true },
  { responseMode: "generate", basedOn: false, useRag: false },
];

export const generateVariants = (): OakPromptVariant[] => {
  return variantConfigs.map(({ responseMode, basedOn, useRag }) => {
    const slug = generateAilaPromptVersionVariantSlug(
      responseMode,
      basedOn,
      useRag,
    );
    return generatePromptParts(
      {
        responseMode: responseMode as "interactive" | "generate",
        baseLessonPlan: basedOn ? "dummy" : undefined,
        useRag,
        lessonPlanJsonSchema: "<lessonPlanJsonSchema>",
        llmResponseJsonSchema: "<llmResponseJsonSchema>",
        lessonPlan: {},
        isUsingStructuredOutput:
          process.env.NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED === "true"
            ? true
            : false,
      },
      slug,
    );
  });
};

const ailaGenerate: OakPromptDefinition = {
  appId: "lesson-planner",
  name: "Generate lesson plan",
  slug: "generate-lesson-plan",
  get variants() {
    return generateVariants();
  },
  inputSchema,
  outputSchema,
};

export { ailaGenerate };
