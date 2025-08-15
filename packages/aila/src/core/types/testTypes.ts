/**
 * Type utilities for testing parameter routing logic
 */
import type { ReasoningEffort, Verbosity } from "./modelParameters";

/**
 * Test scenario interface for parameter routing tests
 */
export interface ParameterTestScenario {
  model: string;
  options: TestModelOptions;
  expectGPT5: boolean;
}

/**
 * Test model options that can contain mixed parameters
 */
export interface TestModelOptions {
  temperature?: number;
  reasoning_effort?: ReasoningEffort;
  verbosity?: Verbosity;
}

/**
 * Properly typed test parameters that replace Record<string, any>
 */
export interface TypedTestParams {
  model: string;
  messages: unknown[];
  temperature?: number;
  reasoning_effort?: ReasoningEffort;
  verbosity?: Verbosity;
}

/**
 * Edge case test parameters for null/undefined model handling
 */
export interface EdgeCaseTestParams {
  model: string | null | undefined;
  expected: boolean;
}

/**
 * Invalid parameter test cases for runtime validation
 */
export interface InvalidParameterTestCase {
  reasoning_effort?: string; // Intentionally broader than ReasoningEffort
  verbosity?: string; // Intentionally broader than Verbosity
  temperature?: number | string; // Intentionally broader for invalid cases
}

/**
 * Expected parameters for GPT-5 models in tests
 */
export interface ExpectedGPT5Params {
  reasoning_effort?: ReasoningEffort;
  verbosity?: Verbosity;
  temperature?: undefined;
}

/**
 * Expected parameters for legacy models in tests
 */
export interface ExpectedLegacyParams {
  temperature?: number;
  reasoning_effort?: undefined;
  verbosity?: undefined;
}

/**
 * Test case for parameter validation
 */
export interface ParameterValidationTestCase {
  description: string;
  model: string;
  allParams: TestModelOptions;
  shouldUseGPT5: boolean;
}

/**
 * Test case for partial parameter scenarios
 */
export interface PartialParameterTestCase {
  model: string;
  providedParams: Partial<TestModelOptions>;
  expectedParams: ExpectedGPT5Params | ExpectedLegacyParams;
}

/**
 * Edge case test for model detection
 */
export interface ModelDetectionEdgeCase {
  model: string;
  expectGPT5: boolean;
}

/**
 * Type-safe test helper for creating test scenarios
 */
export function createTestScenario(
  model: string,
  options: TestModelOptions,
  expectGPT5: boolean,
): ParameterTestScenario {
  return { model, options, expectGPT5 };
}

/**
 * Type-safe test helper for parameter validation
 */
export function createValidationTestCase(
  description: string,
  model: string,
  allParams: TestModelOptions,
  shouldUseGPT5: boolean,
): ParameterValidationTestCase {
  return { description, model, allParams, shouldUseGPT5 };
}

/**
 * Type-safe test helper for partial parameter scenarios
 */
export function createPartialTestCase(
  model: string,
  providedParams: Partial<TestModelOptions>,
  expectedParams: ExpectedGPT5Params | ExpectedLegacyParams,
): PartialParameterTestCase {
  return { model, providedParams, expectedParams };
}
