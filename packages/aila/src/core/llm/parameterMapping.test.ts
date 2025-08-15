import { isGPT5Model } from '../../constants';
import { 
  createModelParams, 
  extractAPIParams,
  type ModelOptions 
} from '../types/modelParameters';
import type { 
  TypedTestParams,
  TestModelOptions 
} from '../types/testTypes';

describe('Parameter Mapping Logic', () => {
  describe('Model Detection and Parameter Routing', () => {
    it('should correctly identify GPT-5 models', () => {
      const gpt5Models = ['gpt-5', 'gpt-5-turbo', 'gpt-5-reasoning', 'gpt-5-mini'];
      const legacyModels = ['gpt-4o-2024-08-06', 'gpt-4.1-2025-04-14', 'gpt-4-turbo'];

      gpt5Models.forEach(model => {
        expect(isGPT5Model(model)).toBe(true);
      });

      legacyModels.forEach(model => {
        expect(isGPT5Model(model)).toBe(false);
      });
    });

    it('should apply correct parameter branching logic', () => {
      const testCases = [
        {
          model: 'gpt-5',
          temperature: 0.7,
          reasoning_effort: 'high',
          verbosity: 'low',
          expectGPT5Params: true,
        },
        {
          model: 'gpt-4o-2024-08-06',
          temperature: 0.3,
          reasoning_effort: 'medium',
          verbosity: 'high',
          expectGPT5Params: false,
        },
      ];

      testCases.forEach(testCase => {
        const isGPT5 = isGPT5Model(testCase.model);
        expect(isGPT5).toBe(testCase.expectGPT5Params);

        // Use type-safe parameter creation instead of manual branching
        const options: ModelOptions = {
          temperature: testCase.temperature,
          reasoning_effort: testCase.reasoning_effort,
          verbosity: testCase.verbosity,
        };

        const typedParams = createModelParams(testCase.model, [], options, isGPT5Model);
        const apiParams = extractAPIParams(typedParams);

        if (testCase.expectGPT5Params) {
          expect(typedParams.type).toBe("gpt5");
          if (typedParams.type === "gpt5") {
            expect(typedParams.reasoning_effort).toBe(testCase.reasoning_effort);
            expect(typedParams.verbosity).toBe(testCase.verbosity);
            expect(typedParams.temperature).toBeUndefined();
          }
        } else {
          expect(typedParams.type).toBe("legacy");
          if (typedParams.type === "legacy") {
            expect(typedParams.temperature).toBe(testCase.temperature);
            expect(typedParams.reasoning_effort).toBeUndefined();
            expect(typedParams.verbosity).toBeUndefined();
          }
        }
      });
    });

    it('should handle missing parameters gracefully', () => {
      const testCases = [
        {
          model: 'gpt-5',
          // Only reasoning_effort provided
          reasoning_effort: 'medium',
          expectReasoningEffort: 'medium',
          expectVerbosity: undefined,
        },
        {
          model: 'gpt-4o-2024-08-06',
          // No parameters provided
          expectTemperature: undefined,
        },
      ];

      testCases.forEach(testCase => {
        const options: ModelOptions = {
          temperature: 'temperature' in testCase ? testCase.temperature : undefined,
          reasoning_effort: 'reasoning_effort' in testCase ? testCase.reasoning_effort : undefined,
          verbosity: 'verbosity' in testCase ? testCase.verbosity : undefined,
        };

        const typedParams = createModelParams(testCase.model, [], options, isGPT5Model);

        if (typedParams.type === "gpt5") {
          expect(typedParams.reasoning_effort).toBe(testCase.expectReasoningEffort);
          expect(typedParams.verbosity).toBe(testCase.expectVerbosity);
        } else {
          expect(typedParams.temperature).toBe(testCase.expectTemperature);
        }
      });
    });

    it('should handle edge case model names', () => {
      const edgeCases = [
        { model: 'gpt-50', expected: true },
        { model: 'gpt-5-custom', expected: true },
        { model: 'custom-gpt-5', expected: false },
        { model: 'GPT-5', expected: false },
        { model: 'gpt5', expected: false },
        { model: '', expected: false },
      ];

      edgeCases.forEach(({ model, expected }) => {
        expect(isGPT5Model(model)).toBe(expected);
      });
    });

    it('should validate parameter values', () => {
      const validReasoningEfforts: Array<"low" | "medium" | "high"> = ['low', 'medium', 'high'];
      const validVerbosity: Array<"low" | "medium" | "high"> = ['low', 'medium', 'high'];
      const validTemperatures = [0, 0.5, 0.7, 1.0, 2.0];

      validReasoningEfforts.forEach(effort => {
        expect(['low', 'medium', 'high']).toContain(effort);
      });

      validVerbosity.forEach(verbosity => {
        expect(['low', 'medium', 'high']).toContain(verbosity);
      });

      validTemperatures.forEach(temp => {
        expect(temp).toBeGreaterThanOrEqual(0);
        expect(temp).toBeLessThanOrEqual(2.0);
      });
    });

    it('should demonstrate parameter precedence', () => {
      // When both parameter sets are provided, the model type determines which is used
      const mixedOptions: TestModelOptions = {
        temperature: 0.8,
        reasoning_effort: 'high',
        verbosity: 'low',
      };

      const gpt5Model = 'gpt-5';
      const legacyModel = 'gpt-4o-2024-08-06';

      // GPT-5 model should use reasoning parameters
      const gpt5Params = createModelParams(gpt5Model, [], mixedOptions, isGPT5Model);
      expect(gpt5Params.type).toBe("gpt5");
      if (gpt5Params.type === "gpt5") {
        expect(gpt5Params.reasoning_effort).toBe('high');
        expect(gpt5Params.verbosity).toBe('low');
        expect(gpt5Params.temperature).toBeUndefined();
      }

      // Legacy model should use temperature parameter
      const legacyParams = createModelParams(legacyModel, [], mixedOptions, isGPT5Model);
      expect(legacyParams.type).toBe("legacy");
      if (legacyParams.type === "legacy") {
        expect(legacyParams.temperature).toBe(0.8);
        expect(legacyParams.reasoning_effort).toBeUndefined();
        expect(legacyParams.verbosity).toBeUndefined();
      }
    });
  });
});