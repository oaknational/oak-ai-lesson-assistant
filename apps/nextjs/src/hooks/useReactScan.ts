import { useEffect, useState } from "react";
import { getReport, scan } from "react-scan";

import { aiLogger } from "@oakai/logger";

const log = aiLogger("testing");

declare global {
  interface Window {
    NEXT_PUBLIC_ENABLE_RENDER_SCAN?: string;
  }
}

function getWindowPropertyName<T>(component: React.ComponentType<T>): string {
  return `reactScan${component.displayName ?? component.name ?? "UnknownComponent"}`;
}

function setWindowObjectForPlaywright<T>(
  component: React.ComponentType<T> | undefined,
  report: sortedReport,
) {
  if (component) {
    const windowPropertyName = getWindowPropertyName(component);
    window[windowPropertyName] = report;
  }
}

function transformReport([componentName, report]: [
  string | undefined,
  RenderData,
]) {
  return {
    name: componentName,
    renderCount: report.renders.length,
    totalRenderTime: report.time,
  };
}

interface RenderData {
  count: number;
  time: number;
  renders: Array<unknown>;
  displayName: string | null;
  type: React.ComponentType<unknown> | null;
}

type sortedReport = {
  name: string | undefined;
  renderCount: number;
  totalRenderTime: number;
};

// Enable React Scan for performance monitoring - use with dev:react-scan
// Pass in component to get report for specific component
// Pass in interval to get reports at regular intervals
// When a component is passed it will be added to window object for Playwright
export const useReactScan = <T extends object>(
  component?: React.ComponentType<T>,
  interval?: number,
) => {
  const [scanReports, setScanReports] = useState<
    sortedReport | sortedReport[] | null
  >(null);

  useEffect(() => {
    // const isRenderScanEnabled =
    //   (typeof process !== "undefined" &&
    //     process.env.NEXT_PUBLIC_ENABLE_RENDER_SCAN === "true") ||
    //   (typeof window !== "undefined" &&
    //     window.NEXT_PUBLIC_ENABLE_RENDER_SCAN === "true") ||
    //   (typeof window !== "undefined" &&
    //     window.process?.env?.NEXT_PUBLIC_ENABLE_RENDER_SCAN === "true");
    const isRenderScanEnabled = true;
    if (isRenderScanEnabled) {
      try {
        log.info("Initializing React Scan...");
        scan({
          enabled: true,
          log: true,
          report: true,
          renderCountThreshold: 0,
          showToolbar: true,
        });
        log.info("React Scan initialized successfully");
      } catch (error) {
        log.error("React Scan initialization error:", error);
      }

      const analyzeRenders = () => {
        try {
          log.info("Attempting to get render reports...");

          const allReports = component ? getReport(component) : getReport();

          if (
            allReports instanceof Map &&
            Symbol.iterator in Object(allReports) &&
            component === undefined
          ) {
            const reportsArray = Array.from(allReports.entries())
              .filter(([componentName]) => {
                // Exclude styled components and other library-generated components
                const isCustomComponent =
                  // Check if name exists and doesn't start with known library prefixes
                  componentName &&
                  !componentName.startsWith("Styled") &&
                  !componentName.includes("styled") &&
                  !componentName.startsWith("_") &&
                  !componentName.includes("$") &&
                  componentName !== "div" &&
                  componentName !== "span";

                return isCustomComponent;
              })
              .map(transformReport);

            const sortedReports = reportsArray.toSorted(
              (a, b) => b.renderCount - a.renderCount,
            );

            console.table(sortedReports);
            setScanReports(sortedReports);
          } else if (
            allReports !== null &&
            allReports instanceof Map === false
          ) {
            const transformedReport = transformReport([
              component?.name,
              allReports,
            ]);
            log.info("Single Report:,", transformedReport);
            setScanReports(transformedReport);
            setWindowObjectForPlaywright(component, transformedReport);
          }
        } catch (error) {
          log.error("Performance Monitoring Error:", error);
        }
      };

      if (interval) {
        const performanceInterval = setInterval(analyzeRenders, interval);

        return () => clearInterval(performanceInterval);
      } else {
        analyzeRenders();
      }
    }
  }, [component, interval, setScanReports]);
  return scanReports;
};
