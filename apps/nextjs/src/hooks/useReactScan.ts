import { useEffect } from "react";
import { getReport, scan } from "react-scan";

import { aiLogger } from "@oakai/logger";

const log = aiLogger("ui:performance");

declare global {
  interface Window {
    NEXT_PUBLIC_ENABLE_RENDER_SCAN?: string;
  }
}

const isRenderScanEnabled =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ENABLE_RENDER_SCAN === "true") ||
  (typeof window !== "undefined" &&
    window.NEXT_PUBLIC_ENABLE_RENDER_SCAN === "true");

const getSingleReport = <T>(
  report: RenderData,
  component: React.ComponentType<T>,
) => {
  return transformReport([component?.name, report]);
};

const getSortedAndFilteredReports = (reports: Map<string, RenderData>) => {
  const reportsArray = Array.from(reports.entries())
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
  return sortedReports;
};

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
// - useReactScan({ component: LessonPlanDisplay, interval: 10000 });
// When a component is passed it will be added to window object for Playwright testing

export const useReactScan = <T extends object>({
  component,
  interval,
}: {
  component?: React.ComponentType<T>;
  interval?: number;
}) => {
  useEffect(() => {
    if (isRenderScanEnabled) {
      try {
        log.info("Initializing React Scan...");
        if (typeof window !== "undefined") {
          scan({
            enabled: true,
            log: true,
            report: true,
            renderCountThreshold: 0,
            showToolbar: true,
          });
        }
        log.info("React Scan initialized successfully");
      } catch (error) {
        log.error("React Scan initialization error:", error);
      }

      const getRenderReport = () => {
        try {
          log.info("Attempting to get render reports...");

          const report = component ? getReport(component) : getReport();

          if (report instanceof Map) {
            const allComponentReport = getSortedAndFilteredReports(report);
            log.table(allComponentReport);
          } else if (report !== null && component) {
            const singleComponentReport = getSingleReport(report, component);
            setWindowObjectForPlaywright(component, singleComponentReport);
            log.info("Single Report:,", singleComponentReport);
          }
        } catch (error) {
          log.error("Performance Monitoring Error:", error);
        }
      };
      // If interval is provided, get reports at regular intervals
      if (interval) {
        const performanceInterval = setInterval(getRenderReport, interval);

        return () => clearInterval(performanceInterval);
      } else {
        getRenderReport();
      }
    }
  }, [component, interval]);
};
