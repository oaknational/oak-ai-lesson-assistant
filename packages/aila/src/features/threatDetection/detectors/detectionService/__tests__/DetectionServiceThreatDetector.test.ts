import { createDetectionServiceClient } from "@oakai/core/src/threatDetection/detectionService";

import { DetectionServiceThreatDetector } from "../DetectionServiceThreatDetector";

jest.mock("@oakai/core/src/threatDetection/detectionService", () => ({
  createDetectionServiceClient: jest.fn(),
}));

const mockDetect = jest.fn();

describe("DetectionServiceThreatDetector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(createDetectionServiceClient)
      .mockReturnValue({ detect: mockDetect } as never);
  });

  it("sends the last user message to the service", async () => {
    mockDetect.mockResolvedValue({
      provider: "model_armor",
      isThreat: false,
      message: "No threats detected",
      findings: [],
      details: {},
    });

    await new DetectionServiceThreatDetector().detectThreat([
      { role: "user", content: "first" },
      { role: "assistant", content: "{}" },
      { role: "user", content: "most recent" },
    ]);

    expect(mockDetect).toHaveBeenCalledWith("most recent");
  });

  it("does not call the service when there is no user message", async () => {
    const result = await new DetectionServiceThreatDetector().detectThreat([
      { role: "assistant", content: "{}" },
    ]);

    expect(result.isThreat).toBe(false);
    expect(mockDetect).not.toHaveBeenCalled();
  });
});
