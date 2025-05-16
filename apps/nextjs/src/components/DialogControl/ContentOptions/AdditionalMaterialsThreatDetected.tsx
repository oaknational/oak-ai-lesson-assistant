import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";

import { useResourcesActions } from "@/stores/ResourcesStoreProvider";

type AdditionalMaterialsThreatDetectProps = {
  closeDialog: () => void;
  body: string;
};

const AdditionalMaterialsThreatDetected = ({
  closeDialog,
  body,
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
      <OakP>{body}</OakP>

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
