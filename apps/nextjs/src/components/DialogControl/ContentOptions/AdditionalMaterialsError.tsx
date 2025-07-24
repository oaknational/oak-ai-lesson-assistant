import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";

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

  const docTypeDisplayName = docType
    ? resourceTypesConfig[docType].displayName
    : null;

  const { resetToDefault } = useResourcesActions();
  return (
    <OakFlex
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="center"
      $gap={"space-between-m2"}
    >
      <OakP $textAlign={"center"} $font="body-2">
        {`An error occurred while generating your ${docTypeDisplayName ?? "teaching material"}.`}
      </OakP>
      <OakFlex
        $width={"100%"}
        $flexDirection={"column"}
        $justifyContent={"center"}
        $alignItems={"center"}
        $mb={"space-between-m"}
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
