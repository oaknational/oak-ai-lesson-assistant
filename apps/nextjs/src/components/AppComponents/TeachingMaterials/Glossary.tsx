import { type GlossarySchema } from "@oakai/teaching-materials/src/documents/teachingMaterials/glossary/schema";

import { OakFlex, OakP, OakSpan } from "@oaknational/oak-components";

export const Glossary = ({
  action,
  generation,
}: {
  action: string;
  generation: GlossarySchema;
}) => {
  if (!generation || !action) {
    return null;
  }

  return (
    <OakFlex $gap="spacing-16" $flexDirection="column">
      {generation.glossary.map((item, index) => (
        <OakFlex
          key={`${item.term}-${index}`}
          $flexDirection="row"
          $alignItems="flex-start"
          $mb="spacing-12"
          $flexWrap="wrap"
        >
          <OakP $font="body-2-bold">
            {item.term}
            <OakSpan $font="body-2">{` - ${item.definition}`}</OakSpan>
          </OakP>
        </OakFlex>
      ))}
    </OakFlex>
  );
};
