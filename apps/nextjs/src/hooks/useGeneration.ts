import { useCallback, useEffect, useReducer } from "react";

import type { RateLimitInfo } from "@oakai/api/src/types";
import type { SerializedGeneration } from "@oakai/core/src/models/serializers";
import { GenerationStatus } from "@oakai/db/prisma/client";
import { aiLogger } from "@oakai/logger";
import {
  default as browserLogger,
  default as logger,
} from "@oakai/logger/browser";
import { TRPCClientError } from "@trpc/client";
import type { z } from "zod";

import type { DeepPartial } from "@/utils/types/DeepPartial";

import type { RouterInputs } from "../utils/trpc";
import { trpc } from "../utils/trpc";
import { useDidTransition } from "./useDidTransition";

const log = aiLogger("generation");

export type AdditionalUseGenerationOptions = {
  timeout: number;
  stream?: boolean;
};

/**
 * Allows creating a Generation and then continues polling
 * the API until the generation has been fully processed
 *
 * `requestGeneration(appSlug, promptSlug)` should be called once imperatively to
 * kick-off the generation process
 *
 * Returns a discriminated union with `status`, `data` and `error` keys
 *
 * @example
 *   const { requestGeneration, ...generationQuery } = useGeneration("quiz-generator", "generate-answers", answerSchema)
 *
 *   handler = () => {
 *     requestGeneration({ promptInputs: { question: "What is a cat?" } })
 *   }
 *
 *   return <>
 *     {generationQuery.status === UseGenerationStatus.SUCCESS && <Result response={generationQuery.data.response} />}
 *   </>
 */

export const useGeneration = <TSchema extends z.Schema>(
  appSlug: string,
  promptSlug: string,
  schema: TSchema,
  {
    stream: streamCompletions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    timeout: _timeoutSeconds,
  }: AdditionalUseGenerationOptions,
): UseGenerationReturnValue<TSchema> => {
  const [state, dispatch] = useReducer(useGenerationReducer, initialState);

  const generationQuery = trpc.generations.byId.useQuery(
    { id: state.generationId ?? "" },
    {
      enabled: Boolean(state.generationId),
      select: (data) => {
        if (data.status === GenerationStatus.SUCCESS && !state.error) {
          try {
            const parsedData = schema.parse(data.response);
            return { ...data, response: parsedData };
          } catch (err) {
            browserLogger.error(err);

            const error = new UseGenerationError(
              "The generated content isn't in the right shape",
              UGErrorCode.PARSE_ERROR,
              err as Error,
            );
            log.error("Badly formatted response", { data });
            dispatch({
              type: UGActionType.GenerationFailed,
              error: error,
            });
            return data;
          }
        } else {
          return data;
        }
      },
      refetchInterval: (generation) => {
        // Continue to poll if we don't yet have a generation record,
        // or if we do but it's pending.
        const shouldPoll =
          (!generation?.status ||
            isGenerationRecordLoading(generation.status)) &&
          !state.error;

        return shouldPoll ? 1000 : false;
      },
    },
  );

  const generationStatus = generationQuery.data?.status;

  // This has to be a Boolean (not just falsy) as undefined
  // is interpreted as "not specified" rather than disabled
  const shouldFetchPartialGenerations = Boolean(
    streamCompletions &&
      generationStatus &&
      generationStatus === GenerationStatus.GENERATING,
  );

  const partialGenerationQuery = trpc.generations.getPartialResponse.useQuery(
    state.generationId ?? "",
    {
      enabled: shouldFetchPartialGenerations,
      refetchInterval: (data) => {
        const shouldRefetch = typeof data !== "undefined";
        return shouldRefetch ? 100 : false;
      },
    },
  );

  const didTransitionTo = useDidTransition(generationStatus);
  const requestGenerationQuery = trpc.generations.request.useMutation();

  const requestGeneration = useCallback(
    async (mutationInputs: MutationInputs) => {
      try {
        logger.debug(
          mutationInputs,
          "Requesting generation for prompt: %s",
          promptSlug,
        );

        dispatch({ type: UGActionType.GenerationRequested });

        const response = await requestGenerationQuery.mutateAsync({
          appSlug,
          promptSlug,
          streamCompletion: streamCompletions,
          ...mutationInputs,
        });

        const { generation } = response;

        if (isGenerationRecordLoading(generation.status)) {
          dispatch({
            type: UGActionType.GenerationRequestSuccess,
            generationId: generation.id,
            rateLimit: response.rateLimit as RateLimitInfo,
          });
        } else {
          throw new Error("Error with generation");
        }
      } catch (err) {
        browserLogger.error(err);

        const isRateLimited =
          err instanceof TRPCClientError &&
          err?.data.code === "TOO_MANY_REQUESTS";

        const message = isRateLimited
          ? "You are out of generations, please come back later"
          : "Failed to request generation ";

        dispatch({
          type: UGActionType.GenerationFailed,
          error: new UseGenerationError(
            message,
            isRateLimited ? UGErrorCode.RATE_LIMITED : UGErrorCode.UNKNOWN,
            err as Error,
          ),
        });
      }
    },
    [appSlug, promptSlug, requestGenerationQuery, streamCompletions],
  );

  useEffect(() => {
    /**
     * The bulk of the logic of the hook is watching for transitions
     * in the status of the requested generation and updating the state
     *
     * We use didTransitionTo to make sure we're capturing the change in
     * states rather than just re-renders of the effect
     */
    if (didTransitionTo(GenerationStatus.SUCCESS) && generationQuery.data) {
      // * -> SUCCESS
      dispatch({
        type: UGActionType.GenerationSuccess,
        generation: generationQuery.data,
      });
    } else if (didTransitionTo(GenerationStatus.FAILED)) {
      // * -> FAILED
      // query.data.error is the `error` text field on a Generation, which may or
      // may not contain information we want to surface
      const cause = new Error(generationQuery.data?.error ?? "Unknown error");

      const error = new UseGenerationError(
        "Something went wrong",
        UGErrorCode.GENERATION_ERROR,
        cause,
      );

      dispatch({
        type: UGActionType.GenerationFailed,
        error,
      });
    } else if (
      didTransitionTo(GenerationStatus.FLAGGED) &&
      generationQuery.data?.error
    ) {
      // * -> FLAGGED
      const errorText = generationQuery.data.error;
      dispatch({
        type: UGActionType.GenerationFailed,
        error: new UseGenerationError(
          errorText,
          UGErrorCode.GENERATION_FLAGGED,
        ),
      });
    } else if (didTransitionTo(GenerationStatus.PENDING)) {
      // * -> PENDING
      dispatch({
        type: UGActionType.GenerationStatusUpdated,
        nextStatus: UseGenerationStatus.PENDING,
      });
    } else if (didTransitionTo(GenerationStatus.MODERATING)) {
      // * -> MODERATING
      dispatch({
        type: UGActionType.GenerationStatusUpdated,
        nextStatus: UseGenerationStatus.MODERATING,
      });
    } else if (didTransitionTo(GenerationStatus.GENERATING)) {
      // * -> GENERATING
      dispatch({
        type: UGActionType.GenerationStatusUpdated,
        nextStatus: UseGenerationStatus.GENERATING,
      });
    } else if (
      generationQuery.error &&
      state.status !== UseGenerationStatus.ERROR
    ) {
      const error = new UseGenerationError(
        "Something went wrong",
        UGErrorCode.GENERATION_ERROR,
        generationQuery.error as unknown as Error,
      );

      dispatch({
        type: UGActionType.GenerationFailed,
        error,
      });
    }
  }, [
    didTransitionTo,
    generationQuery.data,
    generationQuery.error,
    state.status,
  ]);

  useEffect(() => {
    if (
      generationStatus === GenerationStatus.GENERATING &&
      partialGenerationQuery.data
    ) {
      dispatch({
        type: UGActionType.GenerationDataUpdated,
        partialGenerationResponse: partialGenerationQuery.data,
      });
    }
  }, [partialGenerationQuery.data, generationStatus]);

  return {
    ...state,
    requestGeneration,
  };
};

export const enum UseGenerationStatus {
  IDLE = "IDLE",
  REQUESTING = "REQUESTING",
  REQUESTED = "REQUESTED",
  PENDING = "PENDING",
  MODERATING = "MODERATING",
  GENERATING = "GENERATING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

const initialState: HookState<z.ZodType<unknown>> = {
  status: UseGenerationStatus.IDLE,
  error: null,
  data: null,
  partialResponse: null,
  rateLimit: null,
  generationId: null,
};

function useGenerationReducer<TSchema extends z.Schema>(
  state: HookState<TSchema>,
  action: UGAction<TSchema>,
): HookState<TSchema> {
  switch (action.type) {
    case UGActionType.GenerationRequested:
      return {
        ...state,
        status: UseGenerationStatus.REQUESTING,
        generationId: null,
        data: null,
        partialResponse: null,
        error: null,
        rateLimit: null,
      };
    case UGActionType.GenerationRequestSuccess:
      return {
        ...state,
        status: UseGenerationStatus.REQUESTED,
        generationId: action.generationId,
        error: null,
        data: null,
        partialResponse: null,
        rateLimit: action.rateLimit,
      };
    case UGActionType.GenerationStatusUpdated:
      return {
        ...state,
        status: action.nextStatus,
      } as HookState<TSchema>;
    case UGActionType.GenerationDataUpdated:
      return {
        ...state,
        partialResponse: action.partialGenerationResponse,
      };
    case UGActionType.GenerationSuccess:
      return {
        ...state,
        status: UseGenerationStatus.SUCCESS,
        data: action.generation,
        generationId: state.generationId as string,
        rateLimit: state.rateLimit as RateLimitInfo,
        error: null,
      };
    case UGActionType.GenerationFailed:
      return {
        ...state,
        status: UseGenerationStatus.ERROR,
        data: null,
        partialResponse: null,
        generationId: state.generationId as string,
        rateLimit: state.rateLimit as RateLimitInfo,
        error: action.error,
      };
    default:
      return state;
  }
}

type MutationInputs = Omit<
  RouterInputs["generations"]["request"],
  "appSlug" | "promptSlug"
>;

export type GenerationWithResponse<Data> = Omit<
  SerializedGeneration,
  "response"
> & {
  response: Data;
};

export type SuccessfulGenerationState<TSchema extends z.Schema> = {
  generationId: string;
  status: UseGenerationStatus.SUCCESS;
  data: GenerationWithResponse<z.infer<TSchema>>;
  partialResponse: null;
  error: null;
  rateLimit: RateLimitInfo;
};

enum UGErrorCode {
  GENERATION_ERROR = "GENERATION_ERROR",
  TIMED_OUT = "TIMED_OUT",
  VALIDATION = "VALIDATION",
  PARSE_ERROR = "PARSE_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  GENERATION_FLAGGED = "GENERATION_FLAGGED",
  RATE_LIMITED = "RATE_LIMITED",
  UNKNOWN = "UNKNOWN",
}

export type FailedGenerationState = {
  status: UseGenerationStatus.ERROR;
  generationId: string;
  data: null;
  partialResponse: null;
  error: UseGenerationError;
  rateLimit: RateLimitInfo;
};

type RequestingGenerationState = {
  status: UseGenerationStatus.REQUESTING;
  generationId: null;
  data: null;
  partialResponse: null;
  error: null;
  rateLimit: null;
};

export type GeneratingGenerationState<TSchema extends z.Schema> = {
  status: UseGenerationStatus.GENERATING;
  generationId: string;
  data: null;
  partialResponse: DeepPartial<z.infer<TSchema>> | null;
  error: null;
  rateLimit: null;
};

export type PendingGenerationState = {
  status:
    | UseGenerationStatus.REQUESTED
    | UseGenerationStatus.PENDING
    | UseGenerationStatus.MODERATING;
  generationId: string;
  data: null;
  partialResponse: null;
  error: null;
  rateLimit: RateLimitInfo;
};

type IdleGenerationState = {
  status: UseGenerationStatus.IDLE;
  generationId: null;
  data: null;
  partialResponse: null;
  error: null;
  rateLimit: RateLimitInfo | null;
};

type HookState<TSchema extends z.Schema> =
  | IdleGenerationState
  | RequestingGenerationState
  | PendingGenerationState
  | GeneratingGenerationState<TSchema>
  | SuccessfulGenerationState<TSchema>
  | FailedGenerationState;

type UseGenerationReturnValue<TSchema extends z.Schema> = {
  requestGeneration: (mutationInputs: MutationInputs) => Promise<void>;
} & HookState<TSchema>;

enum UGActionType {
  GenerationRequestSuccess = "GenerationRequestSuccess",
  GenerationRequested = "GenerationRequested",
  GenerationSuccess = "GenerationSuccess",
  GenerationFailed = "GenerationFailed",
  GenerationStatusUpdated = "GenerationStatusUpdated",
  GenerationDataUpdated = "GenerationDataUpdated",
}

type UGAction<TSchema extends z.Schema> =
  | {
      type: UGActionType.GenerationRequested;
    }
  | {
      type: UGActionType.GenerationRequestSuccess;
      generationId: string;
      rateLimit: RateLimitInfo;
    }
  | {
      type: UGActionType.GenerationSuccess;
      generation: GenerationWithResponse<TSchema>;
    }
  | {
      type: UGActionType.GenerationFailed;
      error: UseGenerationError;
    }
  | {
      type: UGActionType.GenerationStatusUpdated;
      nextStatus: UseGenerationStatus;
    }
  | {
      type: UGActionType.GenerationDataUpdated;
      partialGenerationResponse: DeepPartial<z.TypeOf<TSchema>>;
    };

export function isGenerationHookLoading(status: UseGenerationStatus): boolean {
  switch (status) {
    case UseGenerationStatus.REQUESTING:
    case UseGenerationStatus.REQUESTED:
    case UseGenerationStatus.PENDING:
    case UseGenerationStatus.MODERATING:
    case UseGenerationStatus.GENERATING:
      return true;
    case UseGenerationStatus.IDLE:
    case UseGenerationStatus.SUCCESS:
    case UseGenerationStatus.ERROR:
      return false;
    default:
      throw Error(`Unhandled UseGenerationStatus ${String(status)}`);
  }
}

function isGenerationRecordLoading(status: GenerationStatus): boolean {
  switch (status) {
    case GenerationStatus.REQUESTED:
    case GenerationStatus.PENDING:
    case GenerationStatus.MODERATING:
    case GenerationStatus.GENERATING:
      return true;
    case GenerationStatus.FAILED:
    case GenerationStatus.SUCCESS:
    case GenerationStatus.FLAGGED:
      return false;
    default:
      throw Error(`Unhandled GenerationStatus ${String(status)}`);
  }
}

export class UseGenerationError extends Error {
  code: UGErrorCode;
  cause?: Error;

  constructor(message: string, code: UGErrorCode, cause?: Error) {
    super(message);
    this.name = "UseGenerationError";
    this.code = code;
    this.cause = cause;
  }
}
