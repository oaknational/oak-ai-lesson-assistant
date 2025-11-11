import { materialTypesConfig } from "@oakai/teaching-materials/src/documents/teachingMaterials/materialTypes";

import { OakFlex, OakP, OakPrimaryButton } from "@oaknational/oak-components";

import {
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import { docTypeSelector } from "@/stores/teachingMaterialsStore/selectors";

type TeachingMaterialsErrorProps = {
  closeDialog: () => void;
};

const TeachingMaterialsError = ({
  closeDialog,
}: Readonly<TeachingMaterialsErrorProps>) => {
  const docType = useTeachingMaterialsStore(docTypeSelector);
  const error = useTeachingMaterialsStore((state) => state.error);

  const docTypeDisplayName = docType
    ? materialTypesConfig[docType].displayName
    : null;

  const { resetToDefault } = useTeachingMaterialsActions();
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
      {error?.message && (
        <OakP $textAlign={"center"} $font="body-2" $color="text-error">
          {error.message}
        </OakP>
      )}
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

export default TeachingMaterialsError;
