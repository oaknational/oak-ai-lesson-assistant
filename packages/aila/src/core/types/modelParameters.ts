import type { Message } from "../chat";

/**
 * Discriminated union types for type-safe model parameter handling
 */

export type ReasoningEffort = "low" | "medium" | "high";
export type Verbosity = "low" | "medium" | "high";

/**
 * Generic message type that can be either chat messages or OpenAI API messages
 */
export type GenericMessage = Message | { role: string; content: string };

/**
 * Base parameters that all models share
 */
export interface BaseModelParams<T = GenericMessage[]> {
  model: string;
  messages: T;
}

/**
 * GPT-5 specific parameters using reasoning_effort and verbosity
 */
export interface GPT5ModelParams<T = GenericMessage[]>
  extends BaseModelParams<T> {
  type: "gpt5";
  reasoning_effort?: ReasoningEffort;
  verbosity?: Verbosity;
  temperature?: never;
}

/**
 * Legacy model parameters using temperature
 */
export interface LegacyModelParams<T = GenericMessage[]>
  extends BaseModelParams<T> {
  type: "legacy";
  temperature?: number;
  reasoning_effort?: never;
  verbosity?: never;
}

/**
 * Union type for all model parameters
 */
export type ModelParams<T = GenericMessage[]> =
  | GPT5ModelParams<T>
  | LegacyModelParams<T>;

/**
 * Input options that can be provided by users (before model detection)
 */
export interface ModelOptions {
  temperature?: number;
  reasoning_effort?: ReasoningEffort;
  verbosity?: Verbosity;
}

/**
 * Type guards for model parameter types
 */
export function isGPT5Params<T>(
  params: ModelParams<T>,
): params is GPT5ModelParams<T> {
  return params.type === "gpt5";
}

export function isLegacyParams<T>(
  params: ModelParams<T>,
): params is LegacyModelParams<T> {
  return params.type === "legacy";
}

/**
 * Factory function to create type-safe model parameters
 */
export function createModelParams<T extends GenericMessage[]>(
  model: string,
  messages: T,
  options: ModelOptions,
  isGPT5Model: (model: string) => boolean,
): ModelParams<T> {
  const baseParams = { model, messages };

  if (isGPT5Model(model)) {
    return {
      ...baseParams,
      type: "gpt5",
      reasoning_effort: options.reasoning_effort,
      verbosity: options.verbosity,
    } satisfies GPT5ModelParams<T>;
  } else {
    return {
      ...baseParams,
      type: "legacy",
      temperature: options.temperature,
    } satisfies LegacyModelParams<T>;
  }
}

/**
 * Type-safe parameter extraction for external APIs
 */
export function extractAPIParams<T>(
  params: ModelParams<T>,
): Record<string, unknown> {
  const baseParams = {
    model: params.model,
    messages: params.messages,
  };

  if (isGPT5Params(params)) {
    return {
      ...baseParams,
      ...(params.reasoning_effort && {
        reasoning_effort: params.reasoning_effort,
      }),
      ...(params.verbosity && { verbosity: params.verbosity }),
    };
  } else {
    return {
      ...baseParams,
      ...(params.temperature !== undefined && {
        temperature: params.temperature,
      }),
    };
  }
}
