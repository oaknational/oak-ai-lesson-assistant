import { Profiler, useCallback } from "react";

import { aiLogger } from "@oakai/logger";

const isPerfEnabled = true;
// process.env.NEXT_PUBLIC_ENABLE_PERF === "true" ||
// process.env.NODE_ENV === "development";

const log = aiLogger("profiler");

export function WithProfiler({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}): React.ReactNode {
  const handleRender = useCallback(
    (id: string, phase: string, actualDuration: number) => {
      if (actualDuration > 16) {
        log.warn(`${id}: ${actualDuration.toFixed(1)}ms: ${phase} phase`);
      }
    },
    [],
  );

  if (!isPerfEnabled) return children;

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}
