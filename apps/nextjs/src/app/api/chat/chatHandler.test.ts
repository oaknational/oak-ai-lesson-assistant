import { getThreatDetectionProvider } from "@oakai/core/src/threatDetection/provider";

import { getThreatDetectors } from "./threatDetectors";

jest.mock("@oakai/core/src/threatDetection/provider", () => ({
  getThreatDetectionProvider: jest.fn(),
}));

jest.mock(
  "@oakai/aila/src/features/threatDetection/detectors/helicone/HeliconeThreatDetector",
  () => ({
    HeliconeThreatDetector: jest.fn().mockImplementation(() => ({
      detectThreat: jest.fn(),
      isThreatError: jest.fn().mockResolvedValue(false),
    })),
  }),
);

jest.mock(
  "@oakai/aila/src/features/threatDetection/detectors/lakera/LakeraThreatDetector",
  () => ({
    LakeraThreatDetector: jest.fn().mockImplementation(() => ({
      detectThreat: jest.fn(),
      isThreatError: jest.fn().mockResolvedValue(false),
    })),
  }),
);

jest.mock(
  "@oakai/aila/src/features/threatDetection/detectors/modelArmor/ModelArmorThreatDetector",
  () => ({
    ModelArmorThreatDetector: jest.fn().mockImplementation(() => ({
      detectThreat: jest.fn(),
      isThreatError: jest.fn().mockResolvedValue(false),
    })),
  }),
);

const { HeliconeThreatDetector } = jest.requireMock(
  "@oakai/aila/src/features/threatDetection/detectors/helicone/HeliconeThreatDetector",
);
const { LakeraThreatDetector } = jest.requireMock(
  "@oakai/aila/src/features/threatDetection/detectors/lakera/LakeraThreatDetector",
);
const { ModelArmorThreatDetector } = jest.requireMock(
  "@oakai/aila/src/features/threatDetection/detectors/modelArmor/ModelArmorThreatDetector",
);

describe("getThreatDetectors", () => {
  const mockGetThreatDetectionProvider = jest.mocked(
    getThreatDetectionProvider,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds Helicone plus the selected Model Armor detector", () => {
    mockGetThreatDetectionProvider.mockReturnValue("model_armor");

    const detectors = getThreatDetectors();

    expect(detectors).toHaveLength(2);
    expect(HeliconeThreatDetector).toHaveBeenCalledTimes(1);
    expect(ModelArmorThreatDetector).toHaveBeenCalledTimes(1);
    expect(LakeraThreatDetector).not.toHaveBeenCalled();
  });

  it("builds Helicone plus the selected Lakera detector", () => {
    mockGetThreatDetectionProvider.mockReturnValue("lakera");

    const detectors = getThreatDetectors();

    expect(detectors).toHaveLength(2);
    expect(HeliconeThreatDetector).toHaveBeenCalledTimes(1);
    expect(LakeraThreatDetector).toHaveBeenCalledTimes(1);
    expect(ModelArmorThreatDetector).not.toHaveBeenCalled();
  });
});
