import {
  OakFlex,
  OakHeading,
  OakIcon,
  OakP,
} from "@oaknational/oak-components";

import {
  homeworkMaterialSchema,
  type HomeworkMaterial,
  type SchemaMapType,
} from "../../../../../../packages/additional-materials/src/schemas";

export const Homework = ({
  action,
  generation,
}: {
  action: string;
  generation: HomeworkMaterial;
}) => {
  if (!generation || !action) {
    return;
  }
  console.log("generation", generation);
  //   const parsedGeneration = homeworkMaterialSchema.parse(generation);

  return (
    <OakFlex $gap={"space-between-s"} $flexDirection="column">
      <OakHeading $font={"heading-4"} tag="h2">
        {generation.homework.title}
      </OakHeading>
      <OakP>{generation.homework.description}</OakP>
      <OakFlex $gap={"space-between-s"} $flexDirection="column">
        {generation.homework.tasks.map((task, index) => (
          <OakFlex key={index}>
            <OakP>{task}</OakP>
          </OakFlex>
        ))}
      </OakFlex>
    </OakFlex>
  );
};
