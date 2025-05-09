import { toast } from "react-hot-toast";

import type { SafetyViolation } from "@oakai/db";

import { OakPrimaryButton } from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import { trpc } from "@/utils/trpc";

function SafetyViolationsListItem({
  safetyViolation,
  refetch,
}: {
  readonly safetyViolation: SafetyViolation;
  refetch: () => void;
}) {
  const { id, detectionSource, recordId, recordType } = safetyViolation;
  const removeSafetyViolation =
    trpc.admin.removeSafetyViolationById.useMutation({
      onSuccess: () => {
        toast.success("Safety violation removed");
        refetch();
      },
      onError: (err) => {
        toast.error("Error invalidating moderation");
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
    <li className={`rounded-md border p-8 shadow-sm`}>
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full items-start space-y-8">
          <p className="font-medium capitalize">
            Source: {detectionSource}
            <br />
            Record type: {recordType}
            <br />
            Record ID: {recordId}
          </p>
          {recordType === "MODERATION" ? (
            <OakPrimaryButton
              iconName="cross"
              className="ml-auto"
              onClick={() =>
                void invalidateModeration.mutateAsync({
                  moderationId: recordId,
                })
              }
              isLoading={invalidateModeration.isLoading}
            >
              Invalidate moderation
            </OakPrimaryButton>
          ) : (
            <OakPrimaryButton
              iconName="cross"
              className="ml-auto"
              onClick={() => void removeSafetyViolation.mutateAsync({ id })}
              isLoading={removeSafetyViolation.isLoading}
            >
              Delete safety violation
            </OakPrimaryButton>
          )}
        </div>
      </div>
    </li>
  );
}

export function AdminUserView({
  userId,
  safetyViolations,
  refetchSafetyViolations,
}: {
  readonly userId: string;
  readonly safetyViolations: SafetyViolation[];
  readonly refetchSafetyViolations: () => void;
}) {
  return (
    <>
      <h1 className="mb-18">User: {userId}</h1>
      <h2 className="mb-4 text-2xl font-bold">Safety violations</h2>
      <ul className="mb-18 space-y-4">
        {safetyViolations.map((safetyViolation) => {
          return (
            <SafetyViolationsListItem
              key={safetyViolation.id}
              safetyViolation={safetyViolation}
              refetch={refetchSafetyViolations}
            />
          );
        })}
      </ul>
    </>
  );
}
