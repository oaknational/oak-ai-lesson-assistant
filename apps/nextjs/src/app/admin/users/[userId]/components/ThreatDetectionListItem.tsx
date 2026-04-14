import { toast } from "react-hot-toast";

import type { ThreatDetectionWithSafetyViolation } from "@oakai/core";

import {
  OakAccordion,
  OakSmallSecondaryButton,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import { trpc } from "@/utils/trpc";

import { ThreatDetectionState } from "./ThreatDetectionState";

export function ThreatDetectionListItem({
  threatDetection,
  refetch,
}: {
  readonly threatDetection: ThreatDetectionWithSafetyViolation;
  readonly refetch: () => void;
}) {
  const markFalsePositive =
    trpc.admin.markThreatDetectionFalsePositive.useMutation({
      onSuccess: () => {
        toast.success("Threat detection marked as false positive");
        refetch();
      },
      onError: (err) => {
        toast.error("Error marking false positive");
        Sentry.captureException(err);
      },
    });
  const canMarkFalsePositive = !threatDetection.isFalsePositive;

  return (
    <li className="rounded-md border p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-5">
          <p className="text-sm text-zinc-600">
            {threatDetection.createdAt.toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>

          <figure>
            <figcaption className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Flagged message
            </figcaption>
            <blockquote className="max-w-3xl border-l-4 border-zinc-400 bg-zinc-50 px-5 py-4 text-base leading-relaxed text-zinc-900">
              {threatDetection.threateningMessage}
            </blockquote>
          </figure>

          <dl className="grid gap-2 text-sm text-zinc-700 md:grid-cols-2">
            <div>
              <dt className="font-semibold text-zinc-900">Provider</dt>
              <dd>{threatDetection.provider}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Category</dt>
              <dd>{threatDetection.category ?? "unknown"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Severity</dt>
              <dd>{threatDetection.severity ?? "unknown"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Chat ID</dt>
              <dd className="break-all">{threatDetection.appSessionId}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Message ID</dt>
              <dd className="break-all">
                {threatDetection.messageId ?? "unknown"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Safety violation</dt>
              <dd>
                {threatDetection.safetyViolation
                  ? "Active safety violation"
                  : "No active safety violation"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex w-full flex-col gap-4 lg:max-w-xs lg:flex-none">
          <div className="flex items-center gap-4">
            {canMarkFalsePositive ? (
              <OakSmallSecondaryButton
                iconName="tick"
                onClick={() =>
                  void markFalsePositive.mutateAsync({
                    threatDetectionId: threatDetection.id,
                  })
                }
                isLoading={markFalsePositive.isPending}
              >
                Mark false positive
              </OakSmallSecondaryButton>
            ) : null}
            <div className="ml-auto">
              <ThreatDetectionState threatDetection={threatDetection} />
            </div>
          </div>

          {threatDetection.providerResponse ? (
            <OakAccordion
              header="Provider response"
              id={`threat-provider-response-${threatDetection.id}`}
            >
              <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                <code>
                  {JSON.stringify(threatDetection.providerResponse, null, 2)}
                </code>
              </pre>
            </OakAccordion>
          ) : null}
        </div>
      </div>
    </li>
  );
}
