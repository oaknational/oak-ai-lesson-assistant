"use client";

import { OakBox, OakFlex, OakHeading } from "@oaknational/oak-components";

import LoadingWheel from "@/components/LoadingWheel";
import SignUpSignInLayout from "@/components/SignUpSignInLayout";

export const LegacyUpgradeNotice = () => {
  return (
    <SignUpSignInLayout loaded>
      <OakBox
        $mh="auto"
        $ml={[null, "spacing-48"]}
        $borderRadius="border-radius-m"
        $background="white"
        $pa="spacing-32"
        $maxWidth={"spacing-640"}
      >
        <OakHeading $font="heading-6" tag="h1">
          Preparing your account
        </OakHeading>
        <OakFlex $mt="spacing-16" $width={"100%"} $justifyContent="center">
          <LoadingWheel />
        </OakFlex>
      </OakBox>
    </SignUpSignInLayout>
  );
};
