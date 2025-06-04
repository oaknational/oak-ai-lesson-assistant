import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";

import { useResourcesActions } from "@/stores/ResourcesStoreProvider";

import ModalFooterButtons from "./ModalFooterButtons";

type AdditionalMaterialsRateLimitProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsRateLimit = ({
  closeDialog,
}: Readonly<AdditionalMaterialsRateLimitProps>) => {
  const { resetToDefault } = useResourcesActions();
  return (
    <OakFlex
      data-testid="chat-share-dialog"
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
    >
      <OakP>Rate limit - awaiting designs for this modal</OakP>

      <OakPrimaryButton
        onClick={() => {
          resetToDefault();
          closeDialog();
        }}
      >
        Continue
      </OakPrimaryButton>

      <ModalFooterButtons
        closeDialog={closeDialog}
        // TODO: Add action button states
        actionButtonStates={() => <OakP>Submit</OakP>}
      />
    </OakFlex>
  );
};

export default AdditionalMaterialsRateLimit;
