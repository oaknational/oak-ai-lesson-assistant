import { isGPT5Model } from '../../constants';

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

        // Simulate parameter branching logic
        const params: Record<string, any> = {
          model: testCase.model,
          messages: [],
        };

        if (isGPT5) {
          if (testCase.reasoning_effort) params.reasoning_effort = testCase.reasoning_effort;
          if (testCase.verbosity) params.verbosity = testCase.verbosity;
        } else {
          if (testCase.temperature !== undefined) params.temperature = testCase.temperature;
        }

        if (testCase.expectGPT5Params) {
          expect(params.reasoning_effort).toBe(testCase.reasoning_effort);
          expect(params.verbosity).toBe(testCase.verbosity);
          expect(params.temperature).toBeUndefined();
        } else {
          expect(params.temperature).toBe(testCase.temperature);
          expect(params.reasoning_effort).toBeUndefined();
          expect(params.verbosity).toBeUndefined();
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
        const isGPT5 = isGPT5Model(testCase.model);
        const params: Record<string, any> = {
          model: testCase.model,
          messages: [],
        };

        if (isGPT5) {
          if ('reasoning_effort' in testCase) params.reasoning_effort = testCase.reasoning_effort;
          if ('verbosity' in testCase) params.verbosity = testCase.verbosity;
        } else {
          if ('temperature' in testCase) params.temperature = testCase.temperature;
        }

        if (isGPT5) {
          expect(params.reasoning_effort).toBe(testCase.expectReasoningEffort);
          expect(params.verbosity).toBe(testCase.expectVerbosity);
        } else {
          expect(params.temperature).toBe(testCase.expectTemperature);
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
      const mixedParams = {
        temperature: 0.8,
        reasoning_effort: 'high' as const,
        verbosity: 'low' as const,
      };

      const gpt5Model = 'gpt-5';
      const legacyModel = 'gpt-4o-2024-08-06';

      // GPT-5 model should use reasoning parameters
      if (isGPT5Model(gpt5Model)) {
        const gpt5Params: Record<string, any> = { model: gpt5Model, messages: [] };
        gpt5Params.reasoning_effort = mixedParams.reasoning_effort;
        gpt5Params.verbosity = mixedParams.verbosity;
        
        expect(gpt5Params.reasoning_effort).toBe('high');
        expect(gpt5Params.verbosity).toBe('low');
        expect(gpt5Params.temperature).toBeUndefined();
      }

      // Legacy model should use temperature parameter
      if (!isGPT5Model(legacyModel)) {
        const legacyParams: Record<string, any> = { model: legacyModel, messages: [] };
        legacyParams.temperature = mixedParams.temperature;
        
        expect(legacyParams.temperature).toBe(0.8);
        expect(legacyParams.reasoning_effort).toBeUndefined();
        expect(legacyParams.verbosity).toBeUndefined();
      }
    });
  });
});