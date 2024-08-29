"use client";

import { useState } from "react";

import { useUser } from "@clerk/nextjs";
import logger from "@oakai/logger/browser";
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLink,
  OakP,
  OakPrimaryButton,
  OakSpan,
} from "@oaknational/oak-components";
import { useReloadSession } from "hooks/useReloadSession";
import Link from "next/link";

import Button from "@/components/Button";
import CheckBox from "@/components/CheckBox";
import SignUpSignInLayout from "@/components/SignUpSignInLayout";
import TermsContent from "@/components/TermsContent";
import { trpc } from "@/utils/trpc";

export const AcceptTermsForm = () => {
  const [dropDownOpen, setDropDownOpen] = useState(true);
  const { isLoaded } = useUser();
  const reloadSession = useReloadSession();

  const [termsAcceptedLocal, setTermsAcceptedLocal] = useState(false);
  const [privacyAcceptedLocal, setPrivacyAcceptedLocal] = useState(false);
  const setDemoStatus = trpc.auth.setDemoStatus.useMutation();
  const acceptTerms = trpc.auth.acceptTerms.useMutation({});

  const handleAcceptTermsOfUse = async () => {
    try {
      await setDemoStatus.mutateAsync();
      logger.debug("Demo status set successfully");

      const response = await acceptTerms.mutateAsync({
        termsOfUse: new Date(),
        privacyPolicy: privacyAcceptedLocal ? new Date() : false,
      });

      if (!response?.acceptedTermsOfUse) {
        throw new Error("Could not accept terms of use");
      }
      logger.debug("Terms of use accepted successfully.");

      await reloadSession();
      logger.debug("Session token refreshed successfully. Redirecting");

      window.location.href = "/?reason=onboarded";
    } catch (error) {
      logger.error(error, "An error occurred while accepting terms of use");
    }
  };

  return (
    <SignUpSignInLayout loaded={isLoaded}>
      <OakBox
        $mh="auto"
        $borderRadius="border-radius-m"
        $background="white"
        $pa="inner-padding-xl2"
        $maxWidth={"all-spacing-22"}
      >
        <OakHeading $font="heading-6" tag="h1">
          This product is experimental and uses AI
        </OakHeading>
        <OakBox $mt="space-between-s">
          <OakP>
            We have worked to ensure that our tools are as high quality and as
            safe as possible but we cannot guarantee accuracy. Please use with
            caution.
          </OakP>
        </OakBox>

        <OakBox $pt="inner-padding-m" $mv="space-between-s">
          <CheckBox
            label="Accept"
            setValue={setPrivacyAcceptedLocal}
            size="base"
          >
            <OakSpan>
              Keep me updated with latest Oak AI experiments, resources and
              other helpful content by email. You can unsubscribe at any time.
              See our{" "}
              <OakLink element={Link} href="/legal/privacy">
                privacy policy
              </OakLink>
              .
            </OakSpan>
          </CheckBox>
        </OakBox>

        {termsAcceptedLocal ? (
          <OakFlex $flexDirection="column" $gap="all-spacing-7">
            <p>
              Terms accepted, if the page does not reload please refresh and
              navigate to home.
            </p>
          </OakFlex>
        ) : (
          <OakFlex
            $flexDirection="row"
            $justifyContent="between"
            $gap="all-spacing-4"
            $width="100%"
            $alignItems="center"
            $mt="space-between-l"
          >
            <Button
              variant="text-link"
              onClick={() => setDropDownOpen(!dropDownOpen)}
              icon={dropDownOpen ? "chevron-down" : "chevron-up"}
            >
              See terms
            </Button>
            <OakPrimaryButton
              onClick={() => {
                handleAcceptTermsOfUse();
                setTermsAcceptedLocal(true);
              }}
            >
              I understand
            </OakPrimaryButton>
          </OakFlex>
        )}
        {!dropDownOpen && (
          <OakBox>
            <TermsContent />
          </OakBox>
        )}
      </OakBox>
    </SignUpSignInLayout>
  );
};
