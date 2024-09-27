"use client";

import { OakFlex, OakHeading } from "@oaknational/oak-components";

import LoadingWheel from "@/components/LoadingWheel";
import SignUpSignInLayout from "@/components/SignUpSignInLayout";

export const LegacyUpgradeNotice = () => {
  return (
    <SignUpSignInLayout loaded>
      <OakFlex
        $mh="auto"
        $borderRadius="border-radius-m"
        $background="white"
        $pa="inner-padding-xl2"
        $maxWidth={"all-spacing-22"}
        $justifyContent="center"
        $alignContent="center"
      >
        <OakHeading $font="heading-6" tag="h1">
          Preparing your account
        </OakHeading>
        <OakFlex $mt="space-between-s" $width={"100%"} $justifyContent="center">
          <LoadingWheel />
        </OakFlex>
      </OakFlex>
    </SignUpSignInLayout>
  );
};
