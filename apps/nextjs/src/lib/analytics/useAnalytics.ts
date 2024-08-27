import { useContext } from "react";

import { analyticsContext } from "@/components/ContextProviders/AnalyticsProvider";

const useAnalytics = () => {
  const analytics = useContext(analyticsContext);

  if (!analytics) {
    throw new Error("useAnalytics called outside of AnalyticsProvider");
  }

  return analytics;
};

export default useAnalytics;
