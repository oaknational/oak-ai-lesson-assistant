import {
  type GlossarySchema,
  readingAgeRefinement,
} from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";

import {
  OakFlex,
  OakHeading,
  OakP,
  OakPrimaryButton,
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
          $flexDirection="column"
          $mb="space-between-s"
        >
          <OakP $mr={"space-between-ssx"} $font="body-2-bold">
            {item.term}
          </OakP>
          <OakP $font={"body-2"}>{item.definition}</OakP>
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
