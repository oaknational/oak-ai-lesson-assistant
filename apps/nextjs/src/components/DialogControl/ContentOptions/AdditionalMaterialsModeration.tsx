import { useCallback } from "react";

import { OakFlex, OakP } from "@oaknational/oak-components";

import type { DialogTypes } from "@/components/AppComponents/Chat/Chat/types";

import ModalFooterButtons from "./ModalFooterButtons";

type AdditionalMaterialsModerationProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsModeration = ({
  closeDialog,
}: Readonly<AdditionalMaterialsModerationProps>) => {
  return (
    <OakFlex
      data-testid="chat-share-dialog"
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
    >
      <OakP>Additional Materials Moderation</OakP>
      <ModalFooterButtons
        closeDialog={closeDialog}
        // TODO: Add action button states
        actionButtonStates={() => <OakP>Submit</OakP>}
      />
    </OakFlex>
  );
};

export default AdditionalMaterialsModeration;
