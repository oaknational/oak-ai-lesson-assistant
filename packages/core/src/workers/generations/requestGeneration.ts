import { GenerationStatus, ModerationType, Prisma, prisma } from "@oakai/db";
import {
  structuredLogger as baseLogger,
  aiLogger,
  StructuredLogger,
} from "@oakai/logger";
import { Redis } from "@upstash/redis";
import { NonRetriableError } from "inngest";
import { z } from "zod";

import { createOpenAIModerationsClient } from "../../llm/openai";
import { SafetyViolations } from "../../models";
import { Generations } from "../../models/generations";
import {
  CompletionResult,
  Json,
  LLMCompletionError,
  LLMRefusalError,
  Prompts,
} from "../../models/prompts";
import {
  checkEnglishLanguageScores,
  doOpenAIModeration,
  moderationConfig,
} from "../../utils/moderation";
import { requestGenerationSchema } from "./requestGeneration.schema";

const log = aiLogger("generation");

/**
 * Worker converted from an Inngest function
 */

const openaiModeration = createOpenAIModerationsClient();

const redis = new Redis({
  url: process.env.KV_REST_API_URL as string,
  token: process.env.KV_REST_API_TOKEN as string,
});

// NOTE: MODERATE_ENGLISH_LANGUAGE isn't in doppler envs anywhere
const MODERATE_LANGUAGE = Boolean(process.env.MODERATE_ENGLISH_LANGUAGE);

type RequestGenerationArgs = {
  data: z.infer<(typeof requestGenerationSchema)["data"]>;
  user: z.infer<(typeof requestGenerationSchema)["user"]>;
};

type WorkerResponse = {
  /**
   * Async workers perform work in the background.
   * On Vercel Edge or Cloudflare workers, you need to explicitly handle the pending Promise like this:
   *
   * ```ts
   * const { pending } = requestGenerationWorker({ ... });
   * context.waitUntil(pending)
   * ```
   *
   * See `waitUntil` documentation in
   * [Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#contextwaituntil)
   * and [Vercel](https://vercel.com/docs/functions/edge-middleware/middleware-api#waituntil)
   * for more details.
   * ```
   */
  pending: Promise<void>;
};

export function requestGenerationWorker({
  data,
  user,
}: RequestGenerationArgs): WorkerResponse {
  const promise = (async () => {
    try {
      await invoke({ data, user });
    } catch (e) {
      await onFailure({
        error: e as Error,
        event: { data: { event: { data } } },
        logger: baseLogger,
      });
    }
  })();

  return { pending: promise };
}

async function invoke({ data, user }: RequestGenerationArgs) {
  baseLogger.info(
    `Requesting generation for promptId %s`,
    data?.promptId ?? "Unknown prompt",
  );
  baseLogger.debug({ eventData: data }, "Event data for generation");

  /**
   * --------------------- Input validation ---------------------
   */

  const eventData = requestGenerationSchema.data.safeParse(data);
  const eventUser = requestGenerationSchema.user.safeParse(user);

  if (!eventData.success) {
    throw new NonRetriableError("event.data failed validation", {
      cause: eventData.error,
    });
  } else if (!eventUser.success) {
    throw new NonRetriableError("event.user failed validation", {
      cause: eventUser.error,
    });
  }

  const { appId, promptId, generationId, promptInputs, streamCompletion } =
    data;
  // const { external_id: userId } = eventUser.data;

  // Create a child logger which has the context of our current generation applied
  const logger = baseLogger.child({
    appId,
    promptId,
    generationId,
  });

  const prompts = new Prompts(prisma, logger);
  const generations = new Generations(prisma, logger);
  const safetyViolations = new SafetyViolations(prisma, logger);

  logger.info("Running step: Check generation exists");
  const generationRecord = await generations.byId(generationId);

  if (!generationRecord) {
    throw new NonRetriableError("Generation does not exist");
  }

  if (generationRecord.status !== GenerationStatus.REQUESTED) {
    throw new NonRetriableError("Generation has already been processed");
  }

  await generations.setStatus(generationRecord.id, GenerationStatus.PENDING);

  baseLogger.info("Running step: Lookup prompt");
  const prompt = await prompts.get(promptId, appId);

  if (!prompt) {
    throw new NonRetriableError("Prompt does not exist");
  }

  let promptBody: string;

  baseLogger.info("Running step: Format prompt template");

  try {
    promptBody = await prompts.formatPrompt(prompt.template, promptInputs);

    const promptInputsHash = generations.generatePromptInputsHash(promptInputs);
    await generations.update(generationId, {
      promptText: promptBody,
      promptInputs,
      promptInputsHash,
    });
  } catch (err) {
    logger.error(
      err,
      "Error formatting or saving prompt template: %s",
      err instanceof Error ? err.message : err,
    );

    throw new NonRetriableError("Error formatting or saving prompt template", {
      cause: err,
    });
  }

  /**
   * --------------------- Begin moderation ---------------------
   */
  if (moderationConfig.MODERATION_ENABLED === true) {
    await generations.setStatus(
      generationRecord.id,
      GenerationStatus.MODERATING,
    );

    /**
     * These are quiz-specific keys which we should ignore, as they're
     * almost certainly going to fail checks (e.g. numbers)
     * @TODO: Come up with a more robust solution for this
     */
    const ignoredInputKeys = [
      "subject",
      "ageRange",
      "distractorToRegenerate",
      "numberOfCorrectAnswers",
      "numberOfDistractors",
      "knowledge",
      "transcript",
      "fact",
      "sessionId",
    ];

    const userInput = Object.entries(promptInputs)
      .filter(([key, value]) => !!value && !ignoredInputKeys.includes(key))
      .map(([, value]) => JSON.stringify(value));

    logger.info("Running step: Detect languages");
    const [englishScores, isEnglish] = checkEnglishLanguageScores(userInput);

    if (!isEnglish && MODERATE_LANGUAGE) {
      logger.info("Running step: Save flagged generation (not english)");
      await generations.flagGeneration(
        generationId,
        "That looks like non-English text. We currently only support English.",
        ModerationType.NOT_ENGLISH,
        {
          moderationMeta: { englishScores },
        },
      );
      // Return early and don't process generation further
      return;
    }

    logger.info("Running step: Moderate inputs");
    const { moderationResults, isFlagged, isOverModerationThreshold } =
      await doOpenAIModeration(openaiModeration, userInput);

    if (isFlagged) {
      logger.info(
        "Running step: Save flagged generation (flagged by moderation)",
      );
      await generations.flagGeneration(
        generationId,
        "Inputs were flagged by OpenAI moderation as against their terms of service",
        ModerationType.OPENAI_FLAGGED,
        {
          moderationMeta: {
            moderationResults,
          } as unknown as Prisma.InputJsonObject,
        },
      );
      await safetyViolations.recordViolation(
        eventUser.data.external_id,
        "QUIZ_GENERATION",
        "OPENAI",
        "GENERATION",
        generationId,
      );
      // Return early and don't process generation further
      return;
    } else {
      logger.info("Running step: Save moderation result");
      await generations.update(generationId, {
        moderationMeta: {
          moderationResults,
        } as unknown as Prisma.InputJsonObject,
      });
    }

    if (isOverModerationThreshold) {
      logger.info(
        "Running step: Save flagged generation (over moderation threshold)",
      );
      await generations.flagGeneration(
        generationId,
        "Inputs were flagged by our moderation filter as exceeding our threshold for one or more categories",
        ModerationType.OPENAI_OVER_THRESHOLD,
        {
          moderationMeta: {
            moderationResults,
          } as unknown as Prisma.InputJsonObject,
        },
      );

      // Return early and don't process generation further
      return;
    }
  }

  /**
   * --------------------- Get prompt completion ---------------------
   */
  await generations.setStatus(generationRecord.id, GenerationStatus.GENERATING);

  logger.info("Running step: Get OpenAI completion");
  const promptRecord = await prompts.get(promptId, appId);

  if (!promptRecord) {
    throw new NonRetriableError("Prompt does not exist");
  }

  let completion: CompletionResult | undefined = undefined;
  try {
    logger.info(`Requesting completion for generationId=%s`, generationId);

    /**
     * Stream partial response JSON to redis as the new tokens come in,
     * to work around streaming limitations with netlify
     */
    const onNewToken = async (partialJson: string) => {
      log.info("onNewToken", partialJson);
      try {
        await redis.set(`partial-generation-${generationId}`, partialJson, {
          // Expire after 10 minutes
          ex: 60 * 10,
        });
      } catch (err) {
        logger.error("Failed to write to redis");
        logger.error(err, "Error caching generation stream");
      }
    };

    if (process.env.PROMPT_PLAYBACK_ENABLED === "true") {
      const priorSuccessfulGeneration =
        await generations.getPriorSuccessfulGeneration(promptId, promptInputs);
      if (priorSuccessfulGeneration) {
        const {
          llmTimeTaken,
          promptTokensUsed,
          completionTokensUsed,
          response,
        } = priorSuccessfulGeneration;
        if (response && typeof response === "object") {
          logger.info("Request chat completion from prior generation");
          completion = await prompts.requestChatCompletionFromPriorGeneration({
            timeTaken: llmTimeTaken ?? 0,
            promptTokensUsed,
            completionTokensUsed,
            resultText: JSON.stringify(response),
            //TODO potentially casting here is dangerous
            result: response as unknown as Json,
          });
        }
      }
    }

    if (!completion) {
      logger.info("Request chat completion from LLM");
      completion = await prompts.requestChatCompletion(
        promptBody,
        streamCompletion ? onNewToken : undefined,
      );
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : `Unknown generation error`;

    logger.error(err, errorMessage);

    if (err instanceof LLMRefusalError) {
      const { completionMeta } = err;

      await generations.flagGeneration(
        generationId,
        errorMessage,
        ModerationType.LLM_REFUSAL,
        {
          promptTokensUsed: completionMeta.promptTokensUsed,
          completionTokensUsed: completionMeta.completionTokensUsed,
          llmTimeTaken: completionMeta.timeTaken,
        },
      );

      return null;
    } else if (err instanceof LLMCompletionError) {
      const { completionMeta } = err;

      await generations.failGeneration(generationId, errorMessage, {
        promptTokensUsed: completionMeta.promptTokensUsed,
        completionTokensUsed: completionMeta.completionTokensUsed,
        llmTimeTaken: completionMeta.timeTaken,
      });
      throw new NonRetriableError(errorMessage);
    } else {
      throw new NonRetriableError(errorMessage);
    }
  }

  if (completion?.result) {
    logger.info("Running step: Save successful generation");
    await generations.completeGeneration(
      generationId,
      completion.result satisfies Prisma.InputJsonObject,
      {
        promptTokensUsed: completion.promptTokensUsed,
        completionTokensUsed: completion.completionTokensUsed,
        llmTimeTaken: completion.timeTaken,
      },
    );

    logger.info(
      `Successfully completed generation, generationId=%s`,
      generationId,
    );
  }

  return completion;
}

type OnFailureArgs = {
  error: Error;
  event: {
    data: {
      event: { data: z.infer<(typeof requestGenerationSchema)["data"]> };
    };
  };
  logger: StructuredLogger;
};

async function onFailure({ error, event, logger }: OnFailureArgs) {
  const generations = new Generations(prisma, logger);
  const eventData = event.data.event.data;

  logger.error(
    { err: error, generationId: eventData?.generationId },
    "Failed generation (inngest onFailure called), generationId=%s",
    eventData?.generationId,
  );

  /**
   * Look up the generation, which might not even exist
   * if we've ended up in onFailure. If it's in progress,
   * attempt to mark it as failed (unless failing it was
   * what caused us to get here in the first place!)
   */
  const generationRecord = await generations.byId(eventData.generationId);

  if (generationRecord && !generations.isFinished(generationRecord)) {
    try {
      await generations.failGeneration(eventData.generationId, error.message);
    } catch (err) {
      logger.error({ err }, "Could not mark generation as failed");
    }
  }
}
