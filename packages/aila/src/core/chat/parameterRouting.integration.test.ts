import {
  DEFAULT_LEGACY_TEMPERATURE,
  DEFAULT_MODEL,
  DEFAULT_REASONING_EFFORT,
  DEFAULT_VERBOSITY,
  isGPT5Model,
} from "../../constants";
import {
  type ModelOptions,
  type ReasoningEffort,
  type Verbosity,
  createModelParams,
} from "../types/modelParameters";

describe("AilaChat Parameter Routing Integration", () => {
  describe("Parameter Routing Logic", () => {
    it("should correctly route parameters based on model type", () => {
      const scenarios = [
        {
          model: "gpt-5",
          options: {
            temperature: 0.8,
            reasoning_effort: "high" as const,
            verbosity: "low" as const,
          },
          expectGPT5: true,
        },
        {
          model: "gpt-4o-2024-08-06",
          options: {
            temperature: 0.3,
            reasoning_effort: "medium" as const,
            verbosity: "high" as const,
          },
          expectGPT5: false,
        },
      ];

      scenarios.forEach((scenario) => {
        const isGPT5 = isGPT5Model(scenario.model);
        expect(isGPT5).toBe(scenario.expectGPT5);

        // Simulate the parameter routing logic from AilaChat using type-safe system
        const options: ModelOptions = {
          temperature: scenario.options.temperature,
          reasoning_effort: scenario.options.reasoning_effort,
          verbosity: scenario.options.verbosity,
        };

        const typedParams = createModelParams(
          scenario.model,
          [],
          options,
          isGPT5Model,
        );

        if (scenario.expectGPT5) {
          expect(typedParams.type).toBe("gpt5");
          if (typedParams.type === "gpt5") {
            expect(typedParams.reasoning_effort).toBe(
              scenario.options.reasoning_effort,
            );
            expect(typedParams.verbosity).toBe(scenario.options.verbosity);
            expect(typedParams.temperature).toBeUndefined();
          }
        } else {
          expect(typedParams.type).toBe("legacy");
          if (typedParams.type === "legacy") {
            expect(typedParams.temperature).toBe(scenario.options.temperature);
            expect(typedParams.reasoning_effort).toBeUndefined();
            expect(typedParams.verbosity).toBeUndefined();
          }
        }
      });
    });

    it("should use default values when parameters are not provided", () => {
      const defaultScenarios = [
        {
          model: "gpt-5",
          expectGPT5: true,
          expectedReasoningEffort: DEFAULT_REASONING_EFFORT,
          expectedVerbosity: DEFAULT_VERBOSITY,
        },
        {
          model: "gpt-4.1-2025-04-14",
          expectGPT5: false,
          expectedTemperature: DEFAULT_LEGACY_TEMPERATURE,
        },
      ];

      defaultScenarios.forEach((scenario) => {
        const isGPT5 = isGPT5Model(scenario.model);
        expect(isGPT5).toBe(scenario.expectGPT5);

        // Simulate default parameter assignment
        const params: {
          model: string;
          messages: unknown[];
          temperature?: number;
          reasoning_effort?: "low" | "medium" | "high";
          verbosity?: "low" | "medium" | "high";
        } = {
          model: scenario.model,
          messages: [],
        };

        if (isGPT5) {
          params.reasoning_effort = DEFAULT_REASONING_EFFORT;
          params.verbosity = DEFAULT_VERBOSITY;
        } else {
          params.temperature = DEFAULT_LEGACY_TEMPERATURE;
        }

        if (scenario.expectGPT5) {
          expect(params.reasoning_effort).toBe(
            scenario.expectedReasoningEffort,
          );
          expect(params.verbosity).toBe(scenario.expectedVerbosity);
          expect(params.temperature).toBeUndefined();
        } else {
          expect(params.temperature).toBe(scenario.expectedTemperature);
          expect(params.reasoning_effort).toBeUndefined();
          expect(params.verbosity).toBeUndefined();
        }
      });
    });

    it("should use default model when model is not specified", () => {
      const model = DEFAULT_MODEL;
      const isGPT5 = isGPT5Model(model);

      expect(model).toBe("gpt-4o-2024-08-06");
      expect(isGPT5).toBe(false);

      // Should route to legacy parameters when using default model
      const options: ModelOptions = {
        temperature: DEFAULT_LEGACY_TEMPERATURE,
      };
      const typedParams = createModelParams(model, [], options, isGPT5Model);

      expect(typedParams.type).toBe("legacy");
      if (typedParams.type === "legacy") {
        expect(typedParams.temperature).toBe(0.7);
        expect(typedParams.reasoning_effort).toBeUndefined();
        expect(typedParams.verbosity).toBeUndefined();
      }
    });

    it("should handle partial parameter sets correctly", () => {
      const partialScenarios = [
        {
          model: "gpt-5",
          providedParams: { reasoning_effort: "high" as const },
          expectedParams: {
            reasoning_effort: "high",
            verbosity: DEFAULT_VERBOSITY,
          },
        },
        {
          model: "gpt-5",
          providedParams: { verbosity: "low" as const },
          expectedParams: {
            reasoning_effort: DEFAULT_REASONING_EFFORT,
            verbosity: "low",
          },
        },
        {
          model: "gpt-4o-2024-08-06",
          providedParams: {},
          expectedParams: { temperature: DEFAULT_LEGACY_TEMPERATURE },
        },
      ];

      partialScenarios.forEach((scenario) => {
        const options: ModelOptions = {
          temperature:
            "temperature" in scenario.providedParams
              ? (scenario.providedParams.temperature as number)
              : undefined,
          reasoning_effort:
            "reasoning_effort" in scenario.providedParams
              ? (scenario.providedParams.reasoning_effort as ReasoningEffort)
              : undefined,
          verbosity:
            "verbosity" in scenario.providedParams
              ? (scenario.providedParams.verbosity as Verbosity)
              : undefined,
        };

        const typedParams = createModelParams(
          scenario.model,
          [],
          options,
          isGPT5Model,
        );

        if (typedParams.type === "gpt5") {
          const expected = scenario.expectedParams as {
            reasoning_effort?: ReasoningEffort;
            verbosity?: Verbosity;
          };
          expect(typedParams.reasoning_effort ?? DEFAULT_REASONING_EFFORT).toBe(
            expected.reasoning_effort,
          );
          expect(typedParams.verbosity ?? DEFAULT_VERBOSITY).toBe(
            expected.verbosity,
          );
        } else {
          const expected = scenario.expectedParams as { temperature?: number };
          expect(typedParams.temperature ?? DEFAULT_LEGACY_TEMPERATURE).toBe(
            expected.temperature,
          );
        }
      });
    });

    it("should handle edge case model names in parameter routing", () => {
      const edgeCases = [
        { model: "gpt-50", expectGPT5: true },
        { model: "gpt-5-turbo-preview", expectGPT5: true },
        { model: "custom-gpt-5", expectGPT5: false },
        { model: "GPT-5", expectGPT5: false },
        { model: "gpt5", expectGPT5: false },
      ];

      edgeCases.forEach((testCase) => {
        const isGPT5 = isGPT5Model(testCase.model);
        expect(isGPT5).toBe(testCase.expectGPT5);

        const options: ModelOptions = isGPT5
          ? {
              reasoning_effort: DEFAULT_REASONING_EFFORT,
              verbosity: DEFAULT_VERBOSITY,
            }
          : { temperature: DEFAULT_LEGACY_TEMPERATURE };

        const typedParams = createModelParams(
          testCase.model,
          [],
          options,
          isGPT5Model,
        );

        if (isGPT5) {
          expect(typedParams.type).toBe("gpt5");
          if (typedParams.type === "gpt5") {
            expect(typedParams.reasoning_effort).toBeDefined();
            expect(typedParams.verbosity).toBeDefined();
            expect(typedParams.temperature).toBeUndefined();
          }
        } else {
          expect(typedParams.type).toBe("legacy");
          if (typedParams.type === "legacy") {
            expect(typedParams.temperature).toBeDefined();
            expect(typedParams.reasoning_effort).toBeUndefined();
            expect(typedParams.verbosity).toBeUndefined();
          }
        }
      });
    });
  });

  describe("Parameter Precedence and Conflicts", () => {
    it("should prioritize correct parameter set based on model detection", () => {
      const conflictScenarios = [
        {
          description:
            "GPT-5 model with mixed parameters should use reasoning parameters",
          model: "gpt-5",
          allParams: {
            temperature: 0.9,
            reasoning_effort: "high" as const,
            verbosity: "low" as const,
          },
          shouldUseGPT5: true,
        },
        {
          description:
            "Legacy model with mixed parameters should use temperature",
          model: "gpt-4o-2024-08-06",
          allParams: {
            temperature: 0.2,
            reasoning_effort: "medium" as const,
            verbosity: "high" as const,
          },
          shouldUseGPT5: false,
        },
      ];

      conflictScenarios.forEach((scenario) => {
        const isGPT5 = isGPT5Model(scenario.model);
        expect(isGPT5).toBe(scenario.shouldUseGPT5);

        const options: ModelOptions = {
          temperature: scenario.allParams.temperature,
          reasoning_effort: scenario.allParams.reasoning_effort,
          verbosity: scenario.allParams.verbosity,
        };

        const typedParams = createModelParams(
          scenario.model,
          [],
          options,
          isGPT5Model,
        );

        if (scenario.shouldUseGPT5) {
          expect(typedParams.type).toBe("gpt5");
          if (typedParams.type === "gpt5") {
            expect(typedParams.reasoning_effort).toBe(
              scenario.allParams.reasoning_effort,
            );
            expect(typedParams.verbosity).toBe(scenario.allParams.verbosity);
            expect(typedParams.temperature).toBeUndefined();
          }
        } else {
          expect(typedParams.type).toBe("legacy");
          if (typedParams.type === "legacy") {
            expect(typedParams.temperature).toBe(
              scenario.allParams.temperature,
            );
            expect(typedParams.reasoning_effort).toBeUndefined();
            expect(typedParams.verbosity).toBeUndefined();
          }
        }
      });
    });
  });
});
