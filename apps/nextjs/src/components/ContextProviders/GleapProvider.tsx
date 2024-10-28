"use client";

import type { PropsWithChildren} from "react";
import { useEffect } from "react";

import { useAuth, useUser } from "@clerk/nextjs";
import { useOakConsent } from "@oaknational/oak-consent-client";
import Gleap from "gleap";

import { ServicePolicyMap } from "@/lib/cookie-consent/ServicePolicyMap";

export const GleapProvider = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const user = useUser();

  const gleapFrameUrl = process.env.NEXT_PUBLIC_GLEAP_FRAME_URL as string;
  const gleapApiUrl = process.env.NEXT_PUBLIC_GLEAP_API_URL as string;
  const gleapApiKey = process.env.NEXT_PUBLIC_GLEAP_API_KEY as string;

  const analyticsAccepted =
    useOakConsent().getConsent(ServicePolicyMap.GLEAP) === "granted";

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_GLEAP === "false") {
      return;
    }
    if (gleapApiKey && analyticsAccepted) {
      if (!Gleap.getInstance().initialized) {
        // use first party domains
        Gleap.setFrameUrl(gleapFrameUrl);
        Gleap.setApiUrl(gleapApiUrl);
        Gleap.initialize(gleapApiKey);
      }
      Gleap.showFeedbackButton(true);
      // identify user if they are logged in
      if (auth.userId && user.user?.fullName) {
        Gleap.identify(auth.userId, {
          name: user.user.fullName,
          email: user.user.primaryEmailAddress?.emailAddress ?? "",
        });
      }
    }

    if (!analyticsAccepted && Gleap.getInstance().initialized) {
      Gleap.showFeedbackButton(false);
      Gleap.clearIdentity();
    }
  }, [
    analyticsAccepted,
    auth.userId,
    gleapApiKey,
    gleapApiUrl,
    gleapFrameUrl,
    user.user?.fullName,
    user.user?.primaryEmailAddress?.emailAddress,
  ]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.bb-feedback-button .bb-feedback-button-classic {
  font-family: Lexend, ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  color: #222222;
}
      `,
        }}
      />
      {children}
    </>
  );
};
