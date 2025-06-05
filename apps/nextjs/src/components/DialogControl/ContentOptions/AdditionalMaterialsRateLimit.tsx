import {
  OakFlex,
  OakLink,
  OakP,
  OakPrimaryButton,
} from "@oaknational/oak-components";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useResourcesActions } from "@/stores/ResourcesStoreProvider";

type AdditionalMaterialsRateLimitProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsRateLimit = ({
  closeDialog,
}: Readonly<AdditionalMaterialsRateLimitProps>) => {
  const { resetToDefault } = useResourcesActions();
  const { isDemoUser, demo } = useDemoUser();

  if (!isDemoUser) {
    return null;
  }
  return (
    <>
      <OakP>
        You have {demo.additionalMaterialsSessionsRemaining} of your{" "}
        {demo.appSessionsPerMonth} teaching materials available this month. If
        you are a teacher in the UK, please{" "}
        <OakLink href={demo.contactHref}>contact us for full access.</OakLink>
      </OakP>

      <OakFlex
        $width={"100%"}
        $justifyContent={"center"}
        $alignItems={"center"}
        $mb={"space-between-m"}
      >
        <OakPrimaryButton
          onClick={() => {
            resetToDefault();
            closeDialog();
          }}
        >
          Continue
        </OakPrimaryButton>
      </OakFlex>
    </>
  );
};

export default AdditionalMaterialsRateLimit;
