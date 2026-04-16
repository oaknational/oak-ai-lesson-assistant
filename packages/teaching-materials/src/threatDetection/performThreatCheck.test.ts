import { getThreatDetectionProvider } from "@oakai/core/src/threatDetection/provider";

import { performLakeraThreatCheck } from "./lakeraThreatCheck";
import { performModelArmorThreatCheck } from "./modelArmorThreatCheck";
import { performThreatCheck } from "./performThreatCheck";

jest.mock("@oakai/core/src/threatDetection/provider", () => ({
  getThreatDetectionProvider: jest.fn(),
}));

jest.mock("./lakeraThreatCheck", () => ({
  performLakeraThreatCheck: jest.fn(),
}));

jest.mock("./modelArmorThreatCheck", () => ({
  performModelArmorThreatCheck: jest.fn(),
}));

const mockGetThreatDetectionProvider = jest.mocked(getThreatDetectionProvider);
const mockPerformLakeraThreatCheck = jest.mocked(performLakeraThreatCheck);
const mockPerformModelArmorThreatCheck = jest.mocked(
  performModelArmorThreatCheck,
);

describe("performThreatCheck", () => {
  const messages = [{ role: "user" as const, content: "test prompt" }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches to Lakera when selected", async () => {
    const lakeraResult = {
      provider: "lakera",
      isThreat: false,
      message: "No threats detected",
      findings: [],
      details: {},
    };
    mockGetThreatDetectionProvider.mockReturnValue("lakera");
    mockPerformLakeraThreatCheck.mockResolvedValue(lakeraResult);

    await expect(performThreatCheck({ messages })).resolves.toEqual(
      lakeraResult,
    );

    expect(mockPerformLakeraThreatCheck).toHaveBeenCalledWith({ messages });
    expect(mockPerformModelArmorThreatCheck).not.toHaveBeenCalled();
  });

  it("dispatches to Model Armor when selected", async () => {
    const modelArmorResult = {
      provider: "model_armor",
      isThreat: false,
      message: "No threats detected",
      findings: [],
      details: {},
    };
    mockGetThreatDetectionProvider.mockReturnValue("model_armor");
    mockPerformModelArmorThreatCheck.mockResolvedValue(modelArmorResult);

    await expect(performThreatCheck({ messages })).resolves.toEqual(
      modelArmorResult,
    );

    expect(mockPerformModelArmorThreatCheck).toHaveBeenCalledWith({
      messages,
    });
    expect(mockPerformLakeraThreatCheck).not.toHaveBeenCalled();
  });
});
