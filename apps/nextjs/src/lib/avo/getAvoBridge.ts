/**
 * @see https://www.avo.app/docs/implementation/start-using-avo-functions
 */
import browserLogger from "@oakai/logger/browser";
import * as Sentry from "@sentry/nextjs";

import { AnalyticsService } from "@/components/ContextProviders/AnalyticsProvider";

import { PosthogConfig } from "../posthog/posthog";
import { CustomDestination } from "./Avo";

type AnalyticsServices = {
  posthog: Pick<AnalyticsService<PosthogConfig, "posthog">, "track">;
};
/**
 * getAvoBridge returns the bridge between Avo and our analytics services.
 * Namely, when we call Avo.myEvent(), logEvent() gets fired below.
 * We are only using it for named tracking events, not for page views or
 * identify calls.
 */
export const getAvoBridge = ({ posthog }: AnalyticsServices) => {
  const logEvent: CustomDestination["logEvent"] = (
    eventName,
    eventProperties = {},
  ) => {
    const isObject = (
      maybeObject: unknown,
    ): maybeObject is Record<string, unknown> => {
      return (
        typeof maybeObject === "object" &&
        maybeObject !== null &&
        !Array.isArray(maybeObject)
      );
    };
    if (!isObject(eventProperties)) {
      throw new Error("Event properties must be an object");
    }
    try {
      posthog.track(eventName, eventProperties);
    } catch (err) {
      Sentry.captureException(new Error("Failed to track event"), {
        extra: { originalError: err },
      });
      browserLogger.error(err);
    }
  };

  return {
    logEvent,
  };
};

export default getAvoBridge;
