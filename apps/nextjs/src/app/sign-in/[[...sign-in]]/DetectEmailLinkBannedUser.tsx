"use client";

import { useEffect, useRef } from "react";

import { aiLogger } from "@oakai/logger";

import { useClerk, useSignIn } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";

const log = aiLogger("auth");

const DetectEmailLinkBannedUser = () => {
  const clerkSignIn = useSignIn();
  const clerk = useClerk();
  const client = clerk.client;

  const hasBanChecked = useRef(false);

  useEffect(() => {
    if (!clerkSignIn.isLoaded || hasBanChecked.current) return;

    const signIn = clerkSignIn.signIn;
    const firstFactor = signIn?.firstFactorVerification;

    const checkBanStatus = async () => {
      try {
        const res = await fetch("/api/check-ban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: signIn.identifier }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Ban check failed with status ${res.status}`, {
            cause: errorData,
          });
        }

        const data: { banned: boolean } = await res.json();

        if (data.banned) {
          await signIn.create({});

          window.location.href = "/legal/account-locked";
        }
      } catch (err) {
        log.error("Failed to check ban status", err);
        Sentry.captureException(err);
      }
    };

    if (
      firstFactor?.status === "unverified" &&
      firstFactor?.strategy === "email_link" &&
      signIn?.identifier
    ) {
      void checkBanStatus();
      hasBanChecked.current = true;
    }
  }, [clerkSignIn.isLoaded, clerkSignIn.signIn]);

  return null;
};

export default DetectEmailLinkBannedUser;
