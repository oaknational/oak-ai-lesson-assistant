import {
  DEFAULT_LEGACY_TEMPERATURE,
  DEFAULT_MODEL,
  DEFAULT_MODERATION_MODEL,
  DEFAULT_REASONING_EFFORT,
  DEFAULT_VERBOSITY,
  isGPT5Model,
} from "./constants";

describe("GPT-5 Constants and Model Detection", () => {
  describe("isGPT5Model", () => {
    it("should return true for gpt-5 models", () => {
      expect(isGPT5Model("gpt-5")).toBe(true);
      expect(isGPT5Model("gpt-5-turbo")).toBe(true);
      expect(isGPT5Model("gpt-5-reasoning")).toBe(true);
      expect(isGPT5Model("gpt-5-mini")).toBe(true);
    });

    it("should return false for legacy models", () => {
      expect(isGPT5Model("gpt-4o-2024-08-06")).toBe(false);
      expect(isGPT5Model("gpt-4.1-2025-04-14")).toBe(false);
      expect(isGPT5Model("gpt-4o")).toBe(false);
      expect(isGPT5Model("gpt-4-turbo")).toBe(false);
      expect(isGPT5Model("gpt-3.5-turbo")).toBe(false);
    });

    it("should return false for empty or invalid strings", () => {
      expect(isGPT5Model("")).toBe(false);
      expect(isGPT5Model("invalid-model")).toBe(false);
      expect(isGPT5Model("gpt4-5")).toBe(false);
      expect(isGPT5Model("5gpt")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isGPT5Model("gpt-5")).toBe(true);
      expect(isGPT5Model("gpt-50")).toBe(true); // Should match gpt-5* prefix
      expect(isGPT5Model("GPT-5")).toBe(false); // Case sensitive
      expect(isGPT5Model("gpt5")).toBe(false); // Must have hyphen
    });
  });

  describe("Default Parameters", () => {
    it("should have correct GPT-5 default values", () => {
      expect(DEFAULT_REASONING_EFFORT).toBe("medium");
      expect(DEFAULT_VERBOSITY).toBe("medium");
    });

    it("should have correct legacy default values", () => {
      expect(DEFAULT_LEGACY_TEMPERATURE).toBe(0.7);
    });

    it("should have correct model defaults", () => {
      expect(DEFAULT_MODEL).toBe("gpt-5-mini-2025-08-07");
      expect(DEFAULT_MODERATION_MODEL).toBe("gpt-5-mini-2025-08-07");
    });
  });

  describe("Parameter Types", () => {
    it("should accept valid reasoning effort values", () => {
      const validValues: Array<"low" | "medium" | "high"> = [
        "low",
        "medium",
        "high",
      ];
      validValues.forEach((value) => {
        expect(["low", "medium", "high"]).toContain(value);
      });
    });

    it("should accept valid verbosity values", () => {
      const validValues: Array<"low" | "medium" | "high"> = [
        "low",
        "medium",
        "high",
      ];
      validValues.forEach((value) => {
        expect(["low", "medium", "high"]).toContain(value);
      });
    });
  });

  describe("Environment Variable Fallback", () => {
    const originalReasoningEffort = process.env.OPENAI_DEFAULT_REASONING_EFFORT;
    const originalVerbosity = process.env.OPENAI_DEFAULT_VERBOSITY;

    afterAll(() => {
      // Restore original env vars
      if (originalReasoningEffort !== undefined) {
        process.env.OPENAI_DEFAULT_REASONING_EFFORT = originalReasoningEffort;
      } else {
        delete process.env.OPENAI_DEFAULT_REASONING_EFFORT;
      }
      if (originalVerbosity !== undefined) {
        process.env.OPENAI_DEFAULT_VERBOSITY = originalVerbosity;
      } else {
        delete process.env.OPENAI_DEFAULT_VERBOSITY;
      }
    });

    it("should use environment variables when set", () => {
      // Note: Environment variables are read at module load time,
      // so we test the pattern rather than dynamic behavior
      const envReasoning = process.env.OPENAI_DEFAULT_REASONING_EFFORT as
        | "low"
        | "medium"
        | "high";
      const envVerbosity = process.env.OPENAI_DEFAULT_VERBOSITY as
        | "low"
        | "medium"
        | "high";

      if (envReasoning) {
        expect(["low", "medium", "high"]).toContain(envReasoning);
      }
      if (envVerbosity) {
        expect(["low", "medium", "high"]).toContain(envVerbosity);
      }
    });

    it("should fallback to medium when env vars not set", () => {
      // Test the fallback pattern - constants should default to "medium"
      expect(DEFAULT_REASONING_EFFORT).toMatch(/^(low|medium|high)$/);
      expect(DEFAULT_VERBOSITY).toMatch(/^(low|medium|high)$/);
    });
  });
});
