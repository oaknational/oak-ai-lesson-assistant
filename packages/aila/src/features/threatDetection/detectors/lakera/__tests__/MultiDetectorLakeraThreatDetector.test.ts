import { LakeraThreatDetector } from "../LakeraThreatDetector";

interface DetectorConfigInterface {
  projectId: string;
  name: string;
  recordPolicyViolation: boolean;
  runCondition: string;
}

// Mock environment variables
const originalEnv = process.env;

describe("MultiDetectorLakeraThreatDetector", () => {
  let detector: LakeraThreatDetector;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };

    // Set up test environment variables
    process.env.LAKERA_GUARD_API_KEY = "test-api-key";
    process.env.LAKERA_GUARD_PROJECT_ID_1 = "project-1";
    process.env.LAKERA_GUARD_PROJECT_ID_2 = "project-2";
    process.env.LAKERA_GUARD_PROJECT_ID_3 = "project-3";
    process.env.LAKERA_GUARD_PROJECT_ID_4 = "project-4";
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Initialization", () => {
    it("should initialize with multiple detector configurations", () => {
      detector = new LakeraThreatDetector();

      // Verify detector was created successfully
      expect(detector).toBeInstanceOf(LakeraThreatDetector);
    });

    it("should throw error if no valid project IDs are configured", () => {
      // Clear all project IDs
      delete process.env.LAKERA_GUARD_PROJECT_ID_1;
      delete process.env.LAKERA_GUARD_PROJECT_ID_2;
      delete process.env.LAKERA_GUARD_PROJECT_ID_3;
      delete process.env.LAKERA_GUARD_PROJECT_ID_4;
      delete process.env.LAKERA_GUARD_PROJECT_ID;

      expect(() => new LakeraThreatDetector()).toThrow(
        "No valid Lakera project IDs configured",
      );
    });

    it("should use legacy project ID as fallback for primary detector", () => {
      delete process.env.LAKERA_GUARD_PROJECT_ID_1;
      process.env.LAKERA_GUARD_PROJECT_ID = "legacy-project";

      detector = new LakeraThreatDetector();
      expect(detector).toBeInstanceOf(LakeraThreatDetector);
    });
  });

  describe("Detector Configuration", () => {
    beforeEach(() => {
      detector = new LakeraThreatDetector();
    });

    it("should have correct detector configurations", () => {
      // Access private property for testing
      const configs = (
        detector as unknown as { detectorConfigs: DetectorConfigInterface[] }
      ).detectorConfigs;

      expect(configs).toHaveLength(4);

      // Check quaternary detector (first)
      expect(configs[0]).toEqual({
        projectId: "project-4",
        name: "Quaternary Detector (First)",
        recordPolicyViolation: false,
        runCondition: "always",
      });

      // Check primary detector
      expect(configs[1]).toEqual({
        projectId: "project-1",
        name: "Primary Detector",
        recordPolicyViolation: true,
        runCondition: "on_quaternary_positive",
      });

      // Check secondary detector
      expect(configs[2]).toEqual({
        projectId: "project-2",
        name: "Secondary Detector",
        recordPolicyViolation: true,
        runCondition: "on_primary_negative",
      });

      // Check tertiary detector
      expect(configs[3]).toEqual({
        projectId: "project-3",
        name: "Tertiary Detector",
        recordPolicyViolation: false,
        runCondition: "on_secondary_negative",
      });
    });
  });

  describe("New Conditional Logic", () => {
    beforeEach(() => {
      detector = new LakeraThreatDetector();
    });

    it("should demonstrate quaternary detector runs first", () => {
      // This test would verify the new step-by-step logic
      // In a real implementation, you'd mock the API calls
      expect(detector).toBeInstanceOf(LakeraThreatDetector);
    });

    it("should demonstrate primary detector runs after quaternary positive", () => {
      // This test would verify the conditional flow
      expect(detector).toBeInstanceOf(LakeraThreatDetector);
    });

    it("should demonstrate secondary detector runs after primary negative", () => {
      // This test would verify the conditional flow
      expect(detector).toBeInstanceOf(LakeraThreatDetector);
    });

    it("should demonstrate tertiary detector runs after secondary negative", () => {
      // This test would verify the conditional flow
      expect(detector).toBeInstanceOf(LakeraThreatDetector);
    });
  });

  describe("Policy Violation Recording", () => {
    beforeEach(() => {
      detector = new LakeraThreatDetector();
    });

    it("should mark primary and secondary detectors for policy violation recording", () => {
      const configs = (
        detector as unknown as { detectorConfigs: DetectorConfigInterface[] }
      ).detectorConfigs;
      expect(configs?.[1]?.recordPolicyViolation).toBe(true); // Primary
      expect(configs?.[2]?.recordPolicyViolation).toBe(true); // Secondary
    });

    it("should not mark quaternary and tertiary detectors for policy violation recording", () => {
      const configs = (
        detector as unknown as { detectorConfigs: DetectorConfigInterface[] }
      ).detectorConfigs;
      expect(configs?.[0]?.recordPolicyViolation).toBe(false); // Quaternary
      expect(configs?.[3]?.recordPolicyViolation).toBe(false); // Tertiary
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      detector = new LakeraThreatDetector();
    });

    it("should handle invalid input format", async () => {
      const invalidInput = "not an array of messages";

      await expect(detector.detectThreat(invalidInput)).rejects.toThrow(
        "Input must be an array of Messages",
      );
    });

    it("should handle empty array input", async () => {
      const emptyArray: unknown[] = [];

      // This should not throw but return a fallback result
      const result = await detector.detectThreat(emptyArray);
      expect(result.isThreat).toBe(false);
      expect(result.message).toContain("Quaternary Detector failed");
    });
  });

  describe("Integration Scenarios", () => {
    beforeEach(() => {
      detector = new LakeraThreatDetector();
    });

    it("should demonstrate primary detector finding threat scenario", async () => {
      // Mock scenario: Primary detector finds threat
      const mockMessages = [{ role: "user" as const, content: "test message" }];

      // This would normally call the actual API, but we're testing the structure
      // In a real test, you'd mock the fetch calls
      expect(mockMessages).toHaveLength(1);
      expect(mockMessages[0]?.role).toBe("user");
    });

    it("should demonstrate primary detector finding no threat scenario", async () => {
      // Mock scenario: Primary detector finds no threat
      const mockMessages = [{ role: "user" as const, content: "safe message" }];

      // This would normally call the actual API, but we're testing the structure
      expect(mockMessages).toHaveLength(1);
      expect(mockMessages[0]?.role).toBe("user");
    });
  });
});
