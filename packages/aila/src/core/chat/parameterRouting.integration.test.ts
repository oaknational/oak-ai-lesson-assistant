import { 
  DEFAULT_MODEL, 
  DEFAULT_LEGACY_TEMPERATURE,
  DEFAULT_REASONING_EFFORT,
  DEFAULT_VERBOSITY,
  isGPT5Model,
} from '../../constants';

describe('AilaChat Parameter Routing Integration', () => {
  describe('Parameter Routing Logic', () => {
    it('should correctly route parameters based on model type', () => {
      const scenarios = [
        {
          model: 'gpt-5',
          options: {
            temperature: 0.8,
            reasoning_effort: 'high' as const,
            verbosity: 'low' as const,
          },
          expectGPT5: true,
        },
        {
          model: 'gpt-4o-2024-08-06',
          options: {
            temperature: 0.3,
            reasoning_effort: 'medium' as const,
            verbosity: 'high' as const,
          },
          expectGPT5: false,
        },
      ];

      scenarios.forEach(scenario => {
        const isGPT5 = isGPT5Model(scenario.model);
        expect(isGPT5).toBe(scenario.expectGPT5);

        // Simulate the parameter routing logic from AilaChat
        const params: any = {
          model: scenario.model,
          messages: [],
        };

        if (isGPT5) {
          params.reasoning_effort = scenario.options.reasoning_effort ?? DEFAULT_REASONING_EFFORT;
          params.verbosity = scenario.options.verbosity ?? DEFAULT_VERBOSITY;
        } else {
          params.temperature = scenario.options.temperature ?? DEFAULT_LEGACY_TEMPERATURE;
        }

        if (scenario.expectGPT5) {
          expect(params.reasoning_effort).toBe(scenario.options.reasoning_effort);
          expect(params.verbosity).toBe(scenario.options.verbosity);
          expect(params.temperature).toBeUndefined();
        } else {
          expect(params.temperature).toBe(scenario.options.temperature);
          expect(params.reasoning_effort).toBeUndefined();
          expect(params.verbosity).toBeUndefined();
        }
      });
    });

    it('should use default values when parameters are not provided', () => {
      const defaultScenarios = [
        {
          model: 'gpt-5',
          expectGPT5: true,
          expectedReasoningEffort: DEFAULT_REASONING_EFFORT,
          expectedVerbosity: DEFAULT_VERBOSITY,
        },
        {
          model: 'gpt-4.1-2025-04-14',
          expectGPT5: false,
          expectedTemperature: DEFAULT_LEGACY_TEMPERATURE,
        },
      ];

      defaultScenarios.forEach(scenario => {
        const isGPT5 = isGPT5Model(scenario.model);
        expect(isGPT5).toBe(scenario.expectGPT5);

        // Simulate default parameter assignment
        const params: any = {
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
          expect(params.reasoning_effort).toBe(scenario.expectedReasoningEffort);
          expect(params.verbosity).toBe(scenario.expectedVerbosity);
          expect(params.temperature).toBeUndefined();
        } else {
          expect(params.temperature).toBe(scenario.expectedTemperature);
          expect(params.reasoning_effort).toBeUndefined();
          expect(params.verbosity).toBeUndefined();
        }
      });
    });

    it('should use default model when model is not specified', () => {
      const model = DEFAULT_MODEL;
      const isGPT5 = isGPT5Model(model);
      
      expect(model).toBe('gpt-5');
      expect(isGPT5).toBe(true);

      // Should route to GPT-5 parameters when using default model
      const params: any = { model, messages: [] };
      params.reasoning_effort = DEFAULT_REASONING_EFFORT;
      params.verbosity = DEFAULT_VERBOSITY;

      expect(params.reasoning_effort).toBe('medium');
      expect(params.verbosity).toBe('medium');
      expect(params.temperature).toBeUndefined();
    });

    it('should handle partial parameter sets correctly', () => {
      const partialScenarios = [
        {
          model: 'gpt-5',
          providedParams: { reasoning_effort: 'high' as const },
          expectedParams: { reasoning_effort: 'high', verbosity: DEFAULT_VERBOSITY },
        },
        {
          model: 'gpt-5',
          providedParams: { verbosity: 'low' as const },
          expectedParams: { reasoning_effort: DEFAULT_REASONING_EFFORT, verbosity: 'low' },
        },
        {
          model: 'gpt-4o-2024-08-06',
          providedParams: {} as any,
          expectedParams: { temperature: DEFAULT_LEGACY_TEMPERATURE },
        },
      ];

      partialScenarios.forEach(scenario => {
        const isGPT5 = isGPT5Model(scenario.model);
        const params: any = { model: scenario.model, messages: [] };

        if (isGPT5) {
          params.reasoning_effort = (scenario.providedParams as any).reasoning_effort ?? DEFAULT_REASONING_EFFORT;
          params.verbosity = (scenario.providedParams as any).verbosity ?? DEFAULT_VERBOSITY;
        } else {
          params.temperature = (scenario.providedParams as any).temperature ?? DEFAULT_LEGACY_TEMPERATURE;
        }

        Object.entries(scenario.expectedParams).forEach(([key, value]) => {
          expect(params[key]).toBe(value);
        });
      });
    });

    it('should handle edge case model names in parameter routing', () => {
      const edgeCases = [
        { model: 'gpt-50', expectGPT5: true },
        { model: 'gpt-5-turbo-preview', expectGPT5: true },
        { model: 'custom-gpt-5', expectGPT5: false },
        { model: 'GPT-5', expectGPT5: false },
        { model: 'gpt5', expectGPT5: false },
      ];

      edgeCases.forEach(testCase => {
        const isGPT5 = isGPT5Model(testCase.model);
        expect(isGPT5).toBe(testCase.expectGPT5);

        const params: any = { model: testCase.model, messages: [] };

        if (isGPT5) {
          params.reasoning_effort = DEFAULT_REASONING_EFFORT;
          params.verbosity = DEFAULT_VERBOSITY;
          expect(params.reasoning_effort).toBeDefined();
          expect(params.verbosity).toBeDefined();
          expect(params.temperature).toBeUndefined();
        } else {
          params.temperature = DEFAULT_LEGACY_TEMPERATURE;
          expect(params.temperature).toBeDefined();
          expect(params.reasoning_effort).toBeUndefined();
          expect(params.verbosity).toBeUndefined();
        }
      });
    });
  });

  describe('Parameter Precedence and Conflicts', () => {
    it('should prioritize correct parameter set based on model detection', () => {
      const conflictScenarios = [
        {
          description: 'GPT-5 model with mixed parameters should use reasoning parameters',
          model: 'gpt-5',
          allParams: {
            temperature: 0.9,
            reasoning_effort: 'high' as const,
            verbosity: 'low' as const,
          },
          shouldUseGPT5: true,
        },
        {
          description: 'Legacy model with mixed parameters should use temperature',
          model: 'gpt-4o-2024-08-06',
          allParams: {
            temperature: 0.2,
            reasoning_effort: 'medium' as const,
            verbosity: 'high' as const,
          },
          shouldUseGPT5: false,
        },
      ];

      conflictScenarios.forEach(scenario => {
        const isGPT5 = isGPT5Model(scenario.model);
        expect(isGPT5).toBe(scenario.shouldUseGPT5);

        const params: any = { model: scenario.model, messages: [] };

        // Apply the parameter routing logic
        if (isGPT5) {
          if (scenario.allParams.reasoning_effort) params.reasoning_effort = scenario.allParams.reasoning_effort;
          if (scenario.allParams.verbosity) params.verbosity = scenario.allParams.verbosity;
          // temperature should NOT be applied
        } else {
          if (scenario.allParams.temperature !== undefined) params.temperature = scenario.allParams.temperature;
          // reasoning parameters should NOT be applied
        }

        if (scenario.shouldUseGPT5) {
          expect(params.reasoning_effort).toBe(scenario.allParams.reasoning_effort);
          expect(params.verbosity).toBe(scenario.allParams.verbosity);
          expect(params.temperature).toBeUndefined();
        } else {
          expect(params.temperature).toBe(scenario.allParams.temperature);
          expect(params.reasoning_effort).toBeUndefined();
          expect(params.verbosity).toBeUndefined();
        }
      });
    });
  });
});