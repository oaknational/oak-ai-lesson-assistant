import { type GlossarySchema } from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";

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
    <OakFlex $gap="space-between-s" $flexDirection="column">
      {generation.glossary.map((item, index) => (
        <OakFlex
          key={`${item.term}-${index}`}
          $flexDirection="row"
          $justifyContent=""
          $alignItems="flex-start"
          $mb="space-between-xs"
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
