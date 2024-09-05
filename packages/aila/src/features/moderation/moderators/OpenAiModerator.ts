import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { moderationPrompt } from "@oakai/core/src/utils/ailaModeration/moderationPrompt";
import {
  ModerationResult,
  moderationResponseSchema,
} from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import OpenAI from "openai";

import { AilaModerator, AilaModerationError } from ".";
import {
  DEFAULT_MODERATION_MODEL,
  DEFAULT_MODERATION_TEMPERATURE,
} from "../../../constants";
import { AilaServices } from "../../../core";

export class OpenAiModerator extends AilaModerator {
  private _openAIClient: OpenAI;
  private _temperature: number = DEFAULT_MODERATION_TEMPERATURE;
  private _model: string = DEFAULT_MODERATION_MODEL;
  private _aila?: AilaServices;

  constructor({
    chatId,
    userId,
    temperature = DEFAULT_MODERATION_TEMPERATURE,
    model = DEFAULT_MODERATION_MODEL,
    aila,
  }: {
    chatId: string;
    userId: string | undefined;
    temperature?: number;
    model?: OpenAI.Chat.ChatModel;
    aila?: AilaServices;
  }) {
    super({ chatId, userId });
    this._openAIClient = createOpenAIClient({
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
    this._model = model;
    this._aila = aila;
  }
  async moderate(input: string): Promise<ModerationResult> {
    const moderationResponse = await this._openAIClient.chat.completions.create(
      {
        model: this._model,
        messages: [
          {
            role: "system",
            content: moderationPrompt,
          },
          { role: "user", content: input },
        ],
        temperature: this._temperature,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          // This call uses the resulting JSON lesson plan. The user input has already been checked by helicone.
          "Helicone-LLM-Security-Enabled": "false",
        },
      },
    );

    console.log(
      "Moderation response: ",
      JSON.stringify(moderationResponse, null, 2),
    );

    const response = moderationResponseSchema.safeParse(
      JSON.parse(moderationResponse.choices[0]?.message.content ?? "null"),
    );

    if (!response) {
      // #TODO use the shared errorReporting methods to make these Sentry calls optional
      this._aila?.errorReporter?.addBreadcrumb({
        message: "No message.content in moderation response from OpenAI",
        data: { moderationResponse },
      });
      throw new AilaModerationError(`Failed to get moderation response`);
    }
    if (!response.data) {
      this._aila?.errorReporter?.addBreadcrumb({
        message: "Invalid moderation response",
        data: { moderationResponse },
      });
      throw new AilaModerationError(`No moderation response`);
    }
    return response.data;
  }
}
