import {
  type GlossarySchema,
  readingAgeRefinement,
} from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";

import {
  OakFlex,
  OakP,
  OakPrimaryButton,
  OakSpan,
} from "@oaknational/oak-components";

export const Glossary = ({
  action,
  generation,
  handleSubmit,
}: {
  action: string;
  generation: GlossarySchema;
  handleSubmit?: (refinement: string) => void;
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
          $alignItems="flex-start"
          $mb="space-between-xs"
          $flexWrap="wrap"
        >
          <OakP $font="body-2-bold">
            {item.term}
            <OakSpan $font="body-2">
              -{" "}
              {item.definition.charAt(0).toUpperCase() +
                item.definition.slice(1)}
            </OakSpan>
          </OakP>
        </OakFlex>
      ))}
      {generation &&
        handleSubmit &&
        readingAgeRefinement.map((refinement) => (
          <OakFlex key={refinement}>
            <OakPrimaryButton onClick={() => void handleSubmit(refinement)}>
              {refinement}
            </OakPrimaryButton>
          </OakFlex>
        ))}
    </OakFlex>
  );
};
