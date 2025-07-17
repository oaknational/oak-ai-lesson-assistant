import {
  OakFlex,
  OakHeading,
  OakLink,
  OakP,
  OakPrimaryButton,
  OakTertiaryInvertedButton,
} from "@oaknational/oak-components";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useResourcesActions } from "@/stores/ResourcesStoreProvider";

const RATELIMIT_FORM_URL = process.env.RATELIMIT_FORM_URL;

type AdditionalMaterialsRateLimitProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsRateLimit = ({
  closeDialog,
}: Readonly<AdditionalMaterialsRateLimitProps>) => {
  const { resetToDefault } = useResourcesActions();
  const { isDemoUser, demo } = useDemoUser();

  if (!isDemoUser) {
    return (
      <>
        <OakFlex $flexDirection={"column"} $gap={"space-between-m"}>
          <OakHeading $font={"heading-5"} tag="h1">
            Daily usage limit
          </OakHeading>
          <OakP>
            You've reached your daily usage limit. Please return tomorrow or{" "}
            <OakLink href={RATELIMIT_FORM_URL}>contact us</OakLink> if you need
            a higher limit.
          </OakP>
          <OakFlex
            $width={"100%"}
            $justifyContent={"end"}
            $mb={"space-between-m"}
          >
            <OakPrimaryButton
              onClick={() => {
                resetToDefault();
                closeDialog();
              }}
            >
              Ok
            </OakPrimaryButton>
          </OakFlex>
        </OakFlex>
      </>
    );
  }

  return (
    <>
      <OakFlex $flexDirection={"column"} $gap={"space-between-m"}>
        <OakHeading $font={"heading-5"} tag="h1">
          Demo limit reached
        </OakHeading>
        <OakP $font="body-2">
          You have {demo.additionalMaterialsSessionsRemaining} of your{" "}
          {demo.appSessionsPerMonth} teaching materials available this month. If
          you are a teacher in the UK, please{" "}
          <OakLink href={demo.contactHref}>contact us for full access.</OakLink>
        </OakP>

        <OakFlex
          $width={"100%"}
          $justifyContent={"space-between"}
          $alignItems={"center"}
          $mb={"space-between-m"}
        >
          <OakTertiaryInvertedButton
            onClick={() => {
              resetToDefault();
              closeDialog();
            }}
          >
            Back
          </OakTertiaryInvertedButton>
        </OakFlex>
      </OakFlex>
    </>
  );
};

export default AdditionalMaterialsRateLimit;
