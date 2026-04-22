import type { ThreatDetectionWithSafetyViolation } from "@oakai/core";
import type { SafetyViolation } from "@oakai/db";

import { SafetyViolationListItem } from "./components/SafetyViolationListItem";
import { ThreatDetectionListItem } from "./components/ThreatDetectionListItem";

export function AdminUserView({
  userId,
  safetyViolations,
  maxAllowedSafetyViolations,
  threatDetections,
  refetchUserSafetyReview,
}: {
  readonly userId: string;
  readonly safetyViolations: SafetyViolation[];
  readonly maxAllowedSafetyViolations: number;
  readonly threatDetections: ThreatDetectionWithSafetyViolation[];
  readonly refetchUserSafetyReview: () => void;
}) {
  const linkedViolationIds = new Set(
    threatDetections.flatMap((td) =>
      td.safetyViolationId ? [td.safetyViolationId] : [],
    ),
  );

  return (
    <>
      <h1 className="mb-18">User: {userId}</h1>

      <h2 className="mb-4 text-2xl font-bold">Threat detections</h2>
      {threatDetections.length === 0 ? (
        <p className="mb-18 text-zinc-700">No threat detections found.</p>
      ) : (
        <ul className="mb-18 space-y-8">
          {threatDetections.map((threatDetection) => {
            return (
              <ThreatDetectionListItem
                key={threatDetection.id}
                threatDetection={threatDetection}
                refetch={refetchUserSafetyReview}
              />
            );
          })}
        </ul>
      )}

      <h2 className="mb-4 text-2xl font-bold">
        Total Safety Violations ({safetyViolations.length}/
        {maxAllowedSafetyViolations})
      </h2>
      {safetyViolations.length === 0 ? (
        <p className="text-zinc-700">No active safety violations.</p>
      ) : (
        <ul className="mb-18 space-y-4">
          {safetyViolations.map((safetyViolation) => {
            return (
              <SafetyViolationListItem
                key={safetyViolation.id}
                safetyViolation={safetyViolation}
                hasLinkedThreatDetection={linkedViolationIds.has(
                  safetyViolation.id,
                )}
                refetch={refetchUserSafetyReview}
              />
            );
          })}
        </ul>
      )}
    </>
  );
}
