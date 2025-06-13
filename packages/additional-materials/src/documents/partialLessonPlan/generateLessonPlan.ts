import { z } from "zod";

import { LessonPlanSchema } from "../../../../aila/src/protocol/schema";
import type { ProviderKey } from "../../aiProviders";
import { getLLMGeneration } from "../../aiProviders/getGeneration";
import { getKeystageFromYearGroup } from "../additionalMaterials/promptHelpers";
import {
  buildPartialLessonPrompt,
  buildPartialLessonSystemMessage,
} from "./buildPartialLessonPrompt";
import { type PartialLessonContextSchemaType, lessonFieldKeys } from "./schema";

export const generatePartialLessonPlanObject = async ({
  parsedInput,
  provider = "openai",
}: {
  provider?: ProviderKey;
  parsedInput: {
    context: PartialLessonContextSchemaType;
  };
}) => {
  const { context } = parsedInput;

  const { year } = context;

  const derivedKeystage = getKeystageFromYearGroup(year);

  const sortedLessonParts = context.lessonParts.sort(
    (a, b) => lessonFieldKeys.indexOf(a) - lessonFieldKeys.indexOf(b),
  );

  const orderedLessonParts = Object.fromEntries(
    sortedLessonParts.map((field) => [field, LessonPlanSchema.shape[field]]),
  );

  const schema = z.object(orderedLessonParts).required();

  return await getLLMGeneration(
    {
      prompt: buildPartialLessonPrompt({
        lessonParts: sortedLessonParts,
        year: context.year,
      }),
      systemMessage: buildPartialLessonSystemMessage({
        ...context,
        keyStage: derivedKeystage,
      }),
      schema: schema,
    },
    provider,
  );
};
