import { OakFlex, OakP } from "@oaknational/oak-components";

import { useResourcesStore } from "@/stores/ResourcesStoreProvider";
import { moderationSelector } from "@/stores/resourcesStore/selectors";

import ModalFooterButtons from "./ModalFooterButtons";

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
    >
      <OakP>
        This content that needs additional guidance. Please check carefully
        before using. Learn more about moderation and content guidelines.
      </OakP>
      {moderation?.categories.map((category) => <OakP>{category}</OakP>)}

      <ModalFooterButtons
        closeDialog={closeDialog}
        // TODO: Add action button states
        actionButtonStates={() => <OakP>Submit</OakP>}
      />
    </OakFlex>
  );
};

export default AdditionalMaterialsModeration;
