import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";

import { useResourcesActions } from "@/stores/ResourcesStoreProvider";

type AdditionalMaterialsThreatDetectProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsThreatDetected = ({
  closeDialog,
}: Readonly<AdditionalMaterialsThreatDetectProps>) => {
  const { resetToDefault } = useResourcesActions();
  return (
    <OakFlex
      data-testid="chat-share-dialog"
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
    >
      <OakP>This content ..... threat detected.....</OakP>

      <OakPrimaryButton
        onClick={() => {
          resetToDefault();
          closeDialog();
        }}
      >
        Continue
      </OakPrimaryButton>
    </OakFlex>
  );
};

export default AdditionalMaterialsThreatDetected;
