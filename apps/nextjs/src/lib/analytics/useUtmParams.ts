import { useEffect, useMemo } from "react";

import { useSearchParams } from "next/navigation";

import { useLocalStorage } from "../hooks/use-local-storage";

const LS_KEY_UTM_PARAMS = "oak-utm-params";

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type UtmParamName = (typeof UTM_PARAMS)[number];

export type UtmParams = Partial<Record<UtmParamName, string>>;

type UsePersistUtmParamsReturn = {
  utmParams: UtmParams;
  clearUtmParams: () => void;
};

/**
 * This hook returns the last known UTM parameters so that we can attribute the user's traffic after accepting cookie consent.
 */
export const usePersistUtmParams = (
  enabled: boolean,
): UsePersistUtmParamsReturn => {
  const currentParams = useSearchParams();

  const [storedUtmParams, setUtmParams, clearUtmParams] =
    useLocalStorage<UtmParams>(LS_KEY_UTM_PARAMS, {});

  const utmParamsFromQuery = useMemo(
    () =>
      UTM_PARAMS.reduce((accum: UtmParams, key) => {
        const param = currentParams.get(key);
        if (param) {
          accum[key] = param;
        }
        return accum;
      }, {}),
    [currentParams],
  );

  useEffect(() => {
    // Only update stored params if the query contains UTM params
    if (enabled && Object.keys(utmParamsFromQuery).length) {
      setUtmParams(utmParamsFromQuery);
    }
  }, [utmParamsFromQuery, setUtmParams, enabled]);

  return { utmParams: storedUtmParams, clearUtmParams };
};
