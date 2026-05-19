import { getThreatDetectionProvider } from "@oakai/core/src/threatDetection/provider";

import { getThreatDetectors } from "./threatDetectors";

jest.mock("@oakai/core/src/threatDetection/provider", () => ({
  getThreatDetectionProvider: jest.fn(),
}));

jest.mock(
  "@oakai/aila/src/features/threatDetection/detectors/lakera/LakeraThreatDetector",
  () => ({
    LakeraThreatDetector: jest.fn().mockImplementation(() => ({
      detectThreat: jest.fn(),
    })),
  }),
);

jest.mock(
  "@oakai/aila/src/features/threatDetection/detectors/modelArmor/ModelArmorThreatDetector",
  () => ({
    ModelArmorThreatDetector: jest.fn().mockImplementation(() => ({
      detectThreat: jest.fn(),
    })),
  }),
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

  it("builds the Model Armor detector", () => {
    mockGetThreatDetectionProvider.mockReturnValue("model_armor");

    const detectors = getThreatDetectors();

    expect(detectors).toHaveLength(1);
    expect(ModelArmorThreatDetector).toHaveBeenCalledTimes(1);
    expect(LakeraThreatDetector).not.toHaveBeenCalled();
  });

  it("builds the Lakera detector", () => {
    mockGetThreatDetectionProvider.mockReturnValue("lakera");

    const detectors = getThreatDetectors();

    expect(detectors).toHaveLength(1);
    expect(LakeraThreatDetector).toHaveBeenCalledTimes(1);
    expect(ModelArmorThreatDetector).not.toHaveBeenCalled();
  });
});
