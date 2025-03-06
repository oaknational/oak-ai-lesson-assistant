import { task } from "@oakai/core/src/prompts/lesson-assistant/parts";
import {
  OakFlex,
  OakHeading,
  OakIcon,
  OakLI,
  OakOL,
  OakP,
} from "@oaknational/oak-components";

import {
  homeworkMaterialSchema,
  type HomeworkMaterial,
  type SchemaMapType,
  type ComprehensionTaskType,
} from "../../../../../../packages/additional-materials/src/schemas";

export const ComprehensionTask = ({
  action,
  generation,
}: {
  action: string;
  generation: ComprehensionTaskType;
}) => {
  if (!generation || !action) {
    return;
  }
  console.log("generation", generation);
  //   const parsedGeneration = homeworkMaterialSchema.parse(generation);

  return (
    <OakFlex $gap={"space-between-s"} $flexDirection="column">
      <OakHeading $font={"heading-4"} tag="h2">
        {generation.comprehension.title}
      </OakHeading>
      <OakP>{generation.comprehension.passage}</OakP>
      <OakFlex $gap={"space-between-s"} $flexDirection="column">
        {generation.comprehension.questions.map((task, index) => (
          <OakFlex $gap="space-between-s" $flexDirection={"column"} key={index}>
            <OakP $font="heading-5">{task.questionText}</OakP>

            {task.options && (
              <OakOL>
                {task.options.map((option, index) => (
                  <OakLI key={index}>{option}</OakLI>
                ))}
              </OakOL>
            )}
          </OakFlex>
        ))}
      </OakFlex>
    </OakFlex>
  );
};
