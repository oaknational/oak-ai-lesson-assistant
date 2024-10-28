import { FC, useEffect } from "react";

import * as Sentry from "@sentry/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

import { ConsentState } from "@/components/ContextProviders/CookieConsentProvider";

import { usePersistUtmParams } from "../useUtmParams";

if (typeof window !== "undefined") {
  // We send events to hubspot by pushing to window._hsq
  // This means we can queue events before the script is loaded
  window._hsq = window._hsq || [];
}

const scriptDomain = "js-eu1.hs-scripts.com";
const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;

const reportToSentry = (e: unknown) => {
  const error = new Error("Failed to load Hubspot script");
  Sentry.captureException(error, {
    extra: { error: e },
  });
};

type HubspotScriptProps = {
  consent: ConsentState;
  onLoad: () => void;
};
const HubspotLoader: FC<HubspotScriptProps> = ({ consent, onLoad }) => {
  const pathname = usePathname();
  const currentParams = useSearchParams();

  // Users may land on the site with UTM params for attribution. Hubspot can't
  // track these until consent is granted. Consent may be granted on a future page
  // or after an auth redirect, so we persist the UTM params in localStorage
  const { utmParams, clearUtmParams } = usePersistUtmParams(
    consent === "pending",
  );

  useEffect(() => {
    if (consent === "granted") {
      const mergedParams = new URLSearchParams(utmParams);
      for (const [key, value] of currentParams) {
        mergedParams.append(key, value);
      }

      window._hsq.push(["setPath", `${pathname}?${mergedParams.toString()}`]);
      clearUtmParams();
    }

    // Purposefully only run this effect when consent changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent]);

  if (consent === "granted") {
    return (
      <Script
        src={`//${scriptDomain}/${portalId}.js`}
        onLoad={onLoad}
        onError={reportToSentry}
      />
    );
  }

  return null;
};

export default HubspotLoader;
