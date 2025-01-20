"use client";

import { useEffect, useRef } from "react";

import { useUser } from "@clerk/nextjs";
import logger from "@oakai/logger/browser";

import { AcceptTermsForm } from "@/components/Onboarding/AcceptTermsForm";
import { LegacyUpgradeNotice } from "@/components/Onboarding/LegacyUpgradeNotice";
import { useReloadSession } from "@/hooks/useReloadSession";
import { trpc } from "@/utils/trpc";

export const OnBoarding = () => {
  const { user } = useUser();
  const reloadSession = useReloadSession();
  const setDemoStatus = trpc.auth.setDemoStatus.useMutation();

  const userHasAlreadyAcceptedTerms =
    user?.publicMetadata?.["labs"]?.["isOnboarded"];

  // Edge case: Legacy users have already accepted terms but don't have a demo status
  const isHandlingLegacyCase = useRef(false);
  useEffect(() => {
    async function handleDemoStatusSet() {
      if (userHasAlreadyAcceptedTerms && !isHandlingLegacyCase.current) {
        isHandlingLegacyCase.current = true;
        logger.debug("User has already accepted terms");
        await setDemoStatus.mutateAsync();
        logger.debug("Demo status set successfully");
        await reloadSession();
        logger.debug("Session token refreshed successfully. Redirecting");
        window.location.href = "/?reason=metadata-upgraded";
      }
    }
    handleDemoStatusSet();
  }, [userHasAlreadyAcceptedTerms, setDemoStatus, reloadSession]);

  if (userHasAlreadyAcceptedTerms) {
    return <LegacyUpgradeNotice />;
  }

  // For the typical new user, show the accept terms form
  return <AcceptTermsForm />;
};

export default OnBoarding;
