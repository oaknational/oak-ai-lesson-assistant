import { LessonPlanSchema } from "../../../../aila/src/protocol/schema";
import type { ProviderKey } from "../../aiProviders";
import { getLLMGeneration } from "../../aiProviders/getGeneration";
import {
  buildPartialLessonPrompt,
  buildPartialLessonSystemMessage,
} from "./buildPartialLessonPrompt";
import type { LessonPlanField, PartialLessonContextSchemaType } from "./schema";

export const generatePartialLessonPlanObject = async ({
  parsedInput,
  provider = "openai",
  // lessonParts,
}: {
  provider?: ProviderKey;
  parsedInput: {
    context: PartialLessonContextSchemaType;
  };
  // lessonParts: PartialLessonPlanFieldKeys[];
}) => {
  const { context } = parsedInput;

  const schema = LessonPlanSchema.pick(
    Object.fromEntries(context.lessonParts.map((field) => [field, true])) as {
      [K in LessonPlanField]?: true;
    },
  ).required();

  // console.log("schema", schema.shape);
  // console.log(
  //   "prompt",
  //   buildPartialLessonSystemMessage({
  //     lessonParts: context.lessonParts,
  //   }),
  // );

  return await getLLMGeneration(
    {
      prompt: buildPartialLessonPrompt({ ...context }),
      systemMessage: buildPartialLessonSystemMessage({
        lessonParts: context.lessonParts,
      }),
      schema: schema,
    },
    provider,
  );
};
