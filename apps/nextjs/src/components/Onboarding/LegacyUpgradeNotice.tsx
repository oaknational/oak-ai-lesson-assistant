"use client";

import { OakBox, OakFlex, OakHeading } from "@oaknational/oak-components";

import LoadingWheel from "@/components/LoadingWheel";
import SignUpSignInLayout from "@/components/SignUpSignInLayout";

export const LegacyUpgradeNotice = () => {
  return (
    <SignUpSignInLayout loaded>
      <OakBox
        $mh="auto"
        $ml="space-between-l"
        $borderRadius="border-radius-m"
        $background="white"
        $pa="inner-padding-xl2"
        $maxWidth={"all-spacing-22"}
      >
        <OakHeading $font="heading-6" tag="h1">
          Preparing your account
        </OakHeading>
        <OakFlex $mt="space-between-s" $width={"100%"} $justifyContent="center">
          <LoadingWheel />
        </OakFlex>
      </OakBox>
    </SignUpSignInLayout>
  );
};
