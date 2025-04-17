import { OakFlex, OakP } from "@oaknational/oak-components";

type StepThreeProps = {
  fetchMaterial: Record<string, any>;
  fetchMaterialModeration: Record<string, any>;
  renderGeneratedMaterial: () => React.ReactNode;
  moderation: string | null;
};
const StepThree = ({
  fetchMaterial,
  fetchMaterialModeration,
  renderGeneratedMaterial,
  moderation,
}: StepThreeProps) => {
  return (
    <>
      {fetchMaterial.isLoading && <OakP>Loading...</OakP>}
      <OakFlex $mt={"space-between-m"}>{renderGeneratedMaterial()}</OakFlex>

      {fetchMaterialModeration.isLoading && <OakP>Loading moderation...</OakP>}
      <OakFlex
        $mt={"space-between-l"}
        $gap={"space-between-m"}
        $flexDirection="column"
      >
        {moderation && (
          <p
            dangerouslySetInnerHTML={{
              __html: moderation.replace(/\n/g, "<br />"),
            }}
          />
        )}
      </OakFlex>
    </>
  );
};

export default StepThree;
