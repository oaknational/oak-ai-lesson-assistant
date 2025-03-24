"use client";

import { useEffect, useRef } from "react";

import { aiLogger } from "@oakai/logger";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const log = aiLogger("auth");

// Clerk has a bug where banned users aren't properly handled when returning from Google auth
// Instead, they see an indefinite loading spinner
// We've asked for clarity here: https://discord.com/channels/856971667393609759/1255553827386687498

const DetectStuckBannedUser = () => {
  const clerk = useClerk();

  const router = useRouter();
  const isStuck = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const firstFactor = clerk.client?.signIn.firstFactorVerification;
      if (!firstFactor) {
        return;
      }

      const spinnerActive = !!document.querySelector(".cl-spinner");

      // If the first factor check has succeeded but they're still unauthorized,
      // they're banned in clerk and will be stuck
      const firstFactorStuck =
        firstFactor.status === "verified" &&
        firstFactor.error?.code === "authorization_invalid";

      if (spinnerActive && firstFactorStuck) {
        if (isStuck.current) {
          // After 500ms the user is still stuck
          log.info("Detected stuck user. Reloading");

          // The page will be /sign-in/factor-two...
          // Redirect back to /sign-in root to reset clerk UI and show the correct error
          router.push("/sign-in");
        }
        isStuck.current = true;
      } else {
        isStuck.current = false;
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [clerk, router]);

  return null;
};

export default DetectStuckBannedUser;
