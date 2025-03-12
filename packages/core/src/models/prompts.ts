import type { PrismaClientWithAccelerate } from "@oakai/db";
import type { StructuredLogger } from "@oakai/logger";
import { structuredLogger } from "@oakai/logger";

import type { Logger as InngestLogger } from "inngest/middleware/logger";
import { PromptTemplate } from "langchain/prompts";
import type { BaseMessage } from "langchain/schema";
import { SystemMessage } from "langchain/schema";
import untruncateJson from "untruncate-json";

import { createOpenAILangchainChatClient } from "../llm/langchain";

type CompletionMeta = {
  timeTaken: number;
  promptTokensUsed: number | null;
  completionTokensUsed: number | null;
  resultText?: string;
};

// When we add structured parsing we can find a better type than this
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
export type Json = { [key: string]: JsonValue };

export type CompletionResult = CompletionMeta & {
  result: Json;
};

export class Prompts {
  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    // inngest's logger doesn't allow child logger creation, so make
    // sure we accept instances of that too
    private readonly logger:
      | StructuredLogger
      | InngestLogger = structuredLogger,
  ) {}

  async get(promptId: string, appId: string) {
    return this.prisma.prompt.findFirst({
      where: {
        id: promptId,
        app: { id: appId },
        current: true,
      },
      include: { app: true },
      cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
    });
  }

  async formatPrompt(
    promptTemplate: string,
    promptInputs: Record<string, unknown>,
  ): Promise<string> {
    const template = PromptTemplate.fromTemplate(promptTemplate);

    return await template.format(promptInputs);
  }

  async requestChatCompletionFromPriorGeneration(
    completion: CompletionResult,
    onPartialResponse?: (token: string) => void | Promise<void>,
  ): Promise<CompletionResult> {
    if (onPartialResponse) {
      await onPartialResponse(completion.resultText ?? "");
    }
    return completion;
  }

  async requestChatCompletion(
    promptText: string,
    onPartialResponse?: (token: string) => void | Promise<void>,
  ): Promise<CompletionResult> {
    const startTime = Date.now();

    let tokenUsage: TokenUsage | undefined;

    const streaming = typeof onPartialResponse !== "undefined";

    const model = createOpenAILangchainChatClient({
      app: "quiz-designer",
      fields: {
        temperature: 0.2,
        modelName: "gpt-4",
        streaming,
      },
    });

    const llmInput = [new SystemMessage(promptText)];
    this.logger.debug(
      "Calling model for LLM completion streaming=%o",
      streaming,
    );

    let partialJsonText = "";
    let parseAttempts = 0;

    const completion: BaseMessage = await model.call(llmInput, {
      callbacks: [
        {
          handleLLMNewToken: async (token) => {
            if (onPartialResponse) {
              /**
               * Only bother to start parsing it after we get a few tokens,
               * so untruncateJson can return something valid
               *
               * Give up attempting to parse after we've hit a few errors, as it's
               * likely a bigger problem
               */
              partialJsonText += token;

              if (partialJsonText.length >= 5 && parseAttempts < 3) {
                try {
                  // Attempt to create valid partial JSON from the
                  // tokens we've seen so far
                  const partialJson = JSON.parse(
                    untruncateJson(partialJsonText),
                  );
                  await onPartialResponse(JSON.stringify(partialJson));
                } catch (err) {
                  parseAttempts++;
                  this.logger.error(err, "Error parsing generation stream");
                }
              }
            }
          },
          handleLLMEnd: (output) => {
            if (output.llmOutput) {
              tokenUsage = output.llmOutput.tokenUsage;
            }
          },
          handleChainError: (err) => {
            this.logger.error(err, "LLM chain error");
          },
        },
      ],
    });

    const timeTaken = Date.now() - startTime;

    const meta: CompletionMeta = {
      timeTaken,
      promptTokensUsed: tokenUsage?.promptTokens ?? null,
      completionTokensUsed: tokenUsage?.completionTokens ?? null,
      resultText: completion.content as string,
    };

    if (!completion.content) {
      this.logger.error(meta, "No content returned");
      throw new LLMCompletionError("Failed to generate", meta);
    }

    let result: Json;
    try {
      result = JSON.parse(completion.content as string);
    } catch (err) {
      this.logger.error(meta, "Unable to parse completion JSON", err);
      throw new LLMCompletionError("Couldn't parse completion JSON", meta);
    }

    if ("errorMessage" in result && typeof result.errorMessage === "string") {
      this.logger.info("llm refused to fulfil prompt: %s", result.errorMessage);
      throw new LLMRefusalError(result.errorMessage, meta);
    }

    return {
      ...meta,
      result,
    };
  }
}

/**
 * Something went wrong either calling the LLM,
 * or parsing the response
 */
export class LLMCompletionError extends Error {
  completionMeta: Partial<CompletionMeta>;

  constructor(message: string, meta: Partial<CompletionMeta>) {
    super(message);
    this.name = "LLMCompletionError";
    this.completionMeta = meta;
  }
}

/**
 * The LLM worked, but refused to answer our question
 * and gave us an error message instead
 */
export class LLMRefusalError extends Error {
  completionMeta: Partial<CompletionMeta>;

  constructor(message: string, meta: Partial<CompletionMeta>) {
    super(message);
    this.name = "LLMRefusalError";
    this.completionMeta = meta;
  }
}

type TokenUsage = {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
};
