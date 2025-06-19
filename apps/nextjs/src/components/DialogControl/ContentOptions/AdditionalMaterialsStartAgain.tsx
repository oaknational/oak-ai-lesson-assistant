import { resourceTypesConfig } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import {
  OakFlex,
  OakHeading,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
} from "@oaknational/oak-components";
import invariant from "tiny-invariant";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import { docTypeSelector } from "@/stores/resourcesStore/selectors";

type AdditionalMaterialsStartAgainProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsStartAgain = ({
  closeDialog,
}: Readonly<AdditionalMaterialsStartAgainProps>) => {
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
      <OakHeading
        $font={"heading-5"}
        tag="h1"
        $textAlign="center"
        $mb={"space-between-m"}
      >{`Have you downloaded your ${docTypeDisplayName}?`}</OakHeading>
      <OakP $mb={"space-between-xl"}>
        {`Your lesson ${docTypeDisplayName} will not be saved if you choose to
        start again. Please download your ${docTypeDisplayName} if you want to
        keep a copy.`}
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
          Yes, I want to start again
        </OakPrimaryButton>
        <OakSecondaryLink
          onClick={() => {
            closeDialog();
          }}
        >
          {`Back to ${docTypeDisplayName}`}
        </OakSecondaryLink>
      </OakFlex>
    </OakFlex>
  );
};

export default AdditionalMaterialsStartAgain;
