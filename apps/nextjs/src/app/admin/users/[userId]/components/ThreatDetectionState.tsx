import type { ThreatDetectionWithSafetyViolation } from "@oakai/core";

import { OakTagFunctional } from "@oaknational/oak-components";

export function ThreatDetectionState({
  threatDetection,
}: {
  readonly threatDetection: ThreatDetectionWithSafetyViolation;
}) {
  if (threatDetection.isFalsePositive) {
    return (
      <OakTagFunctional
        useSpan
        label="False positive"
        $background="bg-correct"
        $display="inline-flex"
      />
    );
  }

  return (
    <OakTagFunctional
      useSpan
      label="Active"
      $background="bg-incorrect"
      $display="inline-flex"
    />
  );
}
