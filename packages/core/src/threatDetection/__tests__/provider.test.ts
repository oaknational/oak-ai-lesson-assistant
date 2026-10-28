import { aiLogger } from "@oakai/logger";

import { getThreatDetectionProvider } from "../provider";

jest.mock("@oakai/logger", () => {
  const warn = jest.fn();
  return { aiLogger: jest.fn(() => ({ warn, info: jest.fn() })) };
});

/** The warn the module bound at import time. */
const { warn: mockWarn } = jest.mocked(aiLogger)("aila:threat") as unknown as {
  warn: jest.Mock;
};

describe("getThreatDetectionProvider", () => {
  const original = process.env.THREAT_DETECTION_PROVIDER;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.THREAT_DETECTION_PROVIDER;
    } else {
      process.env.THREAT_DETECTION_PROVIDER = original;
    }
    mockWarn.mockClear();
  });

  it("defaults to model_armor", () => {
    delete process.env.THREAT_DETECTION_PROVIDER;
    expect(getThreatDetectionProvider()).toBe("model_armor");
  });

  it("reads the configured provider", () => {
    process.env.THREAT_DETECTION_PROVIDER = "detection_service";
    expect(getThreatDetectionProvider()).toBe("detection_service");
  });

  it("falls back on an unknown value, and says so rather than failing silently", () => {
    process.env.THREAT_DETECTION_PROVIDER = "typo";

    expect(getThreatDetectionProvider()).toBe("model_armor");
    expect(mockWarn).toHaveBeenCalled();
  });
});
