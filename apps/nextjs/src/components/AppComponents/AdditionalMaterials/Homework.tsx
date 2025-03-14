import { OakFlex, OakHeading, OakP } from "@oaknational/oak-components";

import type { HomeworkMaterialType } from "../../../../../../packages/additional-materials/src/schemas";

export const Homework = ({
  action,
  generation,
}: {
  action: string;
  generation: HomeworkMaterialType;
}) => {
  if (!generation || !action) {
    return;
  }

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
