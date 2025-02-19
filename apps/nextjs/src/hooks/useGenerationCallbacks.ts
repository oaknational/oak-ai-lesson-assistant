import { useCallback, useEffect } from "react";

import * as Sentry from "@sentry/nextjs";
import type { z } from "zod";

import type {
  AdditionalUseGenerationOptions,
  FailedGenerationState,
  GeneratingGenerationState,
  PendingGenerationState,
  SuccessfulGenerationState,
} from "@/hooks/useGeneration";
import {
  UseGenerationError,
  UseGenerationStatus,
  useGeneration,
} from "@/hooks/useGeneration";
import useAnalytics from "@/lib/analytics/useAnalytics";

import { usePreviousValue } from "./usePreviousValue";

type UseGenerationCallbackTypes<TSchema extends z.Schema> = {
  onStart?: (generation: PendingGenerationState) => void;
  onPartialResponse?: (generation: GeneratingGenerationState<TSchema>) => void;
  onSuccess?: (generation: SuccessfulGenerationState<TSchema>) => void;
  onFailure?: (generation: FailedGenerationState) => void;
};

function useGenerationCallbacks<TSchema extends z.Schema>(
  appSlug: string,
  promptSlug: string,
  schema: TSchema,
  additionalOptions: AdditionalUseGenerationOptions,
  callbacks: UseGenerationCallbackTypes<TSchema>,
) {
  const generationState = useGeneration(
    appSlug,
    promptSlug,
    schema,
    additionalOptions,
  );
  const previousStatus = usePreviousValue(generationState.status);

  const { generationId, status } = generationState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const trackGeneration = useCallback((eventName: string) => null, []);

  useEffect(() => {
    if (
      // transition: * -> REQUESTING
      previousStatus !== UseGenerationStatus.REQUESTING &&
      generationState.status === UseGenerationStatus.REQUESTING
    ) {
      trackGeneration("request_generation");
      Sentry.addBreadcrumb({
        message: "Generation requested",
        data: { generationId },
      });
    }

    if (
      // transition: * -> REQUESTED
      previousStatus !== UseGenerationStatus.REQUESTED &&
      generationState.status === UseGenerationStatus.REQUESTED
    ) {
      callbacks.onStart?.(generationState);
      Sentry.addBreadcrumb({
        message: "Generation started",
        data: { generationId },
      });
    }

    if (
      // transition: * -> SUCCESS
      previousStatus !== UseGenerationStatus.SUCCESS &&
      generationState.status === UseGenerationStatus.SUCCESS
    ) {
      callbacks.onSuccess?.(generationState);
      trackGeneration("request_generation_success");
      Sentry.addBreadcrumb({
        message: "Generation success",
        data: { generationId },
      });
    }

    if (
      // transition: * -> ERROR
      previousStatus !== UseGenerationStatus.ERROR &&
      generationState.status === UseGenerationStatus.ERROR
    ) {
      callbacks.onFailure?.(generationState);
      trackGeneration("request_generation_fail");
      if (generationState.error instanceof UseGenerationError) {
        Sentry.captureException(
          generationState.error.cause ?? generationState.error,
        );
      } else {
        Sentry.captureException(generationState.error);
      }
    }
  }, [
    appSlug,
    callbacks,
    generationState,
    status,
    generationId,
    previousStatus,
    promptSlug,
    trackGeneration,
  ]);

  useEffect(() => {
    if (
      generationState.status === UseGenerationStatus.GENERATING &&
      generationState?.partialResponse
    ) {
      callbacks.onPartialResponse?.(generationState);
    }
  }, [callbacks, generationState]);

  return {
    status: generationState.status,
    error: generationState.error,
    requestGeneration: generationState.requestGeneration,
  };
}

export default useGenerationCallbacks;
