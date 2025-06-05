import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";

import { useResourcesStore } from "@/stores/ResourcesStoreProvider";
import { moderationSelector } from "@/stores/resourcesStore/selectors";

type AdditionalMaterialsModerationProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsModeration = ({
  closeDialog,
}: Readonly<AdditionalMaterialsModerationProps>) => {
  const moderation = useResourcesStore(moderationSelector);

  return (
    <OakFlex
      data-testid="chat-share-dialog"
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
      $gap={"space-between-m"}
    >
      <OakP>{moderation?.justification}</OakP>
      <OakFlex $justifyContent={"center"}>
        <OakPrimaryButton
          onClick={() => {
            closeDialog();
          }}
        >
          Continue
        </OakPrimaryButton>
      </OakFlex>
    </OakFlex>
  );
};

export default AdditionalMaterialsModeration;
