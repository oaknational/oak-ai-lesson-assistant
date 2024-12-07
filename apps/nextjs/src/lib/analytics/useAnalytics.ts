import { useContext } from "react";

import {
  analyticsContext,
  type AnalyticsContext,
} from "@/components/ContextProviders/AnalyticsProvider";

const useAnalytics = (): AnalyticsContext => {
  const analytics = useContext(analyticsContext);

  if (!analytics) {
    throw new Error("useAnalytics called outside of AnalyticsProvider");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return analytics as any as AnalyticsContext;
};

export default useAnalytics;
