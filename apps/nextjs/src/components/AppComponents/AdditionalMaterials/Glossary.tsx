import type { GlossarySchema } from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";

import { OakFlex, OakHeading, OakP } from "@oaknational/oak-components";

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
      <OakHeading $font="heading-4" tag="h2">
        Glossary
      </OakHeading>
      {generation.glossary.map((item, index) => (
        <OakFlex
          key={`${item.term}-${index}`}
          $flexDirection="column"
          $gap="space-between-s"
        >
          <OakHeading $font="heading-5" tag="h3">
            {item.term}
          </OakHeading>
          <OakP>{item.definition}</OakP>
          {item.example && (
            <OakP>
              <em>Example: {item.example}</em>
            </OakP>
          )}
        </OakFlex>
      ))}
    </OakFlex>
  );
};
