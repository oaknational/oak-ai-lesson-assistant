import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";
import invariant from "tiny-invariant";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import { docTypeSelector } from "@/stores/resourcesStore/selectors";

type AdditionalMaterialsErrorProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsError = ({
  closeDialog,
}: Readonly<AdditionalMaterialsErrorProps>) => {
  const docType = useResourcesStore(docTypeSelector);
  invariant(docType, "docType must be defined");
  const docTypeDisplayName =
    resourceTypesConfig[docType].displayName.toLowerCase();
  const { resetToDefault } = useResourcesActions();
  return (
    <OakFlex
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
    >
      <OakP $mb={"space-between-xl"}>
        {`An error occurred while generating your ${docTypeDisplayName}.`}
      </OakP>
      <OakFlex
        $width={"100%"}
        $flexDirection={"column"}
        $justifyContent={"center"}
        $alignItems={"center"}
        $gap={"space-between-m"}
      >
        <OakPrimaryButton
          iconName="chevron-right"
          isTrailingIcon
          onClick={() => {
            resetToDefault();
            closeDialog();
          }}
        >
          Please try again
        </OakPrimaryButton>
      </OakFlex>
    </OakFlex>
  );
};

export default AdditionalMaterialsError;
