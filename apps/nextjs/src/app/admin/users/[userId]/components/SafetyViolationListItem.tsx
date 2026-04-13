import { toast } from "react-hot-toast";

import type { SafetyViolation } from "@oakai/db";

import {
  OakSmallSecondaryButton,
  OakTagFunctional,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import { trpc } from "@/utils/trpc";

export function SafetyViolationListItem({
  safetyViolation,
  hasLinkedThreatDetection,
  refetch,
}: {
  readonly safetyViolation: SafetyViolation;
  readonly hasLinkedThreatDetection: boolean;
  readonly refetch: () => void;
}) {
  const { id, detectionSource, recordId, recordType } = safetyViolation;
  const isThreatViolation = detectionSource === "THREAT";

  const removeSafetyViolation =
    trpc.admin.removeSafetyViolationById.useMutation({
      onSuccess: () => {
        toast.success("Safety violation removed");
        refetch();
      },
      onError: (err) => {
        toast.error("Error removing safety violation");
        Sentry.captureException(err);
      },
    });

  const invalidateModeration = trpc.admin.invalidateModeration.useMutation({
    onSuccess: () => {
      toast.success("Moderation invalidated");
      refetch();
    },
    onError: (err) => {
      toast.error("Error invalidating moderation");
      Sentry.captureException(err);
    },
  });

  return (
    <li className="rounded-md border p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <dl className="grid gap-2 text-sm text-zinc-700 md:grid-cols-2">
          <div>
            <dt className="font-semibold text-zinc-900">Source</dt>
            <dd className="capitalize">{detectionSource.toLowerCase()}</dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-900">Record type</dt>
            <dd className="capitalize">{recordType.toLowerCase()}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="font-semibold text-zinc-900">Record ID</dt>
            <dd className="break-all">{recordId}</dd>
          </div>
        </dl>

        <div className="flex shrink-0 flex-col items-end gap-3">
          {isThreatViolation && hasLinkedThreatDetection ? (
            <OakTagFunctional
              useSpan
              label="Managed via threat detections above"
            />
          ) : recordType === "MODERATION" ? (
            <OakSmallSecondaryButton
              iconName="cross"
              onClick={() =>
                void invalidateModeration.mutateAsync({
                  moderationId: recordId,
                })
              }
              isLoading={invalidateModeration.isPending}
            >
              Invalidate moderation
            </OakSmallSecondaryButton>
          ) : (
            <OakSmallSecondaryButton
              iconName="cross"
              onClick={() => void removeSafetyViolation.mutateAsync({ id })}
              isLoading={removeSafetyViolation.isPending}
            >
              Delete violation
            </OakSmallSecondaryButton>
          )}
        </div>
      </div>
    </li>
  );
}
