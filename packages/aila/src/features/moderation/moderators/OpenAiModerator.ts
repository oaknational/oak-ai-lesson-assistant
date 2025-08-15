import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { moderationPrompt } from "@oakai/core/src/utils/ailaModeration/moderationPrompt";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { moderationResponseSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";

import type OpenAI from "openai";
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/index.mjs";
import zodToJsonSchema from "zod-to-json-schema";

import { AilaModerationError, AilaModerator } from ".";
import {
  DEFAULT_MODERATION_MODEL,
  DEFAULT_MODERATION_TEMPERATURE,
  DEFAULT_REASONING_EFFORT,
  DEFAULT_VERBOSITY,
  isGPT5Model,
} from "../../../constants";
import type { AilaServices } from "../../../core/AilaServices";

const log = aiLogger("aila:moderation");

export type OpenAiModeratorArgs = {
  chatId: string;
  userId: string | undefined;
  temperature?: number;
  reasoning_effort?: "low" | "medium" | "high";
  verbosity?: "low" | "medium" | "high";
  model?: OpenAI.Chat.ChatModel;
  aila?: AilaServices;
  openAiClient?: OpenAILike;
};

export interface OpenAILike {
  chat: {
    completions: {
      create(
        body: ChatCompletionCreateParamsNonStreaming,
        options?: OpenAI.RequestOptions,
      ): Promise<ChatCompletion>;
    };
  };
}

export class OpenAiModerator extends AilaModerator {
  protected _openAIClient: OpenAILike;
  private readonly _temperature: number = DEFAULT_MODERATION_TEMPERATURE;
  private readonly _reasoning_effort: "low" | "medium" | "high" = DEFAULT_REASONING_EFFORT;
  private readonly _verbosity: "low" | "medium" | "high" = DEFAULT_VERBOSITY;
  private readonly _model: string = DEFAULT_MODERATION_MODEL;
  private readonly _aila?: AilaServices;

  constructor({
    chatId,
    userId,
    temperature = DEFAULT_MODERATION_TEMPERATURE,
    reasoning_effort = DEFAULT_REASONING_EFFORT,
    verbosity = DEFAULT_VERBOSITY,
    model = DEFAULT_MODERATION_MODEL,
    aila,
    openAiClient,
  }: OpenAiModeratorArgs) {
    super({ chatId, userId });

    this._openAIClient =
      openAiClient ??
      createOpenAIClient({
        app: "moderation",
        chatMeta: {
          chatId,
          userId,
        },
      });
    if (temperature < 0 || temperature > 2) {
      throw new Error("Temperature must be between 0 and 2.");
    }
    this._temperature = temperature;
    this._reasoning_effort = reasoning_effort;
    this._verbosity = verbosity;
    this._model = model;
    this._aila = aila;
  }

  protected async _callOpenAi(
    args: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
    options?: OpenAI.RequestOptions,
  ) {
    return this._openAIClient.chat.completions.create(args, options);
  }

  private async _moderate(
    input: string,
    attempts: number,
  ): Promise<ModerationResult> {
    if (attempts > 3) {
      throw new AilaModerationError("Failed to moderate after 3 attempts");
    }

    const schema = zodToJsonSchema(moderationResponseSchema);

    const modelParams: any = {
      model: this._model,
      messages: [
        {
          role: "system",
          content: moderationPrompt,
        },
        { role: "user", content: input },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "moderationResponse",
          /**
           * Currently `strict` mode does not support minimum/maximum integer types, which
           * we use for the likert scale in the moderation schema.
           * @see https://community.openai.com/t/new-function-calling-with-strict-has-a-problem-with-minimum-integer-type/903258
           */
          // strict: true,
          schema,
        },
      },
    };

    if (isGPT5Model(this._model)) {
      modelParams.reasoning_effort = this._reasoning_effort;
      modelParams.verbosity = this._verbosity;
    } else {
      modelParams.temperature = this._temperature;
    }

    const moderationResponse = await this._callOpenAi(
      modelParams,
      {
        headers: {
          // This call uses the resulting JSON lesson plan. The user input has already been checked by helicone.
          "Helicone-LLM-Security-Enabled": undefined,
        },
      },
    );

    const log = aiLogger("aila:moderation:response");
    log.info(JSON.stringify(moderationResponse));

    const response = moderationResponseSchema.safeParse(
      JSON.parse(moderationResponse.choices[0]?.message.content ?? "null"),
    );

    if (!response) {
      // #TODO use the shared errorReporting methods to make these Sentry calls optional
      this._aila?.errorReporter?.addBreadcrumb({
        message: "No message.content in moderation response from OpenAI",
        data: { moderationResponse },
      });
      throw new AilaModerationError("Failed to get moderation response");
    }
    if (!response.data) {
      this._aila?.errorReporter?.addBreadcrumb({
        message: "Invalid moderation response",
        data: { moderationResponse },
      });
      throw new AilaModerationError("No moderation response");
    }

    const { categories, justification, scores } = response.data;

    return {
      justification,
      scores,
      categories: categories.filter((category) => {
        /**
         * We only want to include the category if the parent category scores below a certain threshold.
         * Seems to improve accuracy of the moderation.
         * In future we may want to adjust this threshold based on subject and key-stage, and the
         * category itself.
         */
        const parentKey = category[0];
        for (const [key, score] of Object.entries(scores)) {
          if (key === parentKey && score < 5) {
            return true;
          }
        }
      }),
    };
  }

  async moderate(input: string): Promise<ModerationResult> {
    try {
      return await this._moderate(input, 0);
    } catch (error) {
      log.error("Moderation error: ", error);
      return await this._moderate(input, 1);
    }
  }
}
