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

  return analytics;
};

export default useAnalytics;
