import {
  AGENTIC_AILA_FEATURE_FLAG,
  getAgenticAilaEnabled,
} from "./getAgenticAilaEnabled";
import { serverSideFeatureFlag } from "./serverSideFeatureFlag";

jest.mock("./serverSideFeatureFlag", () => ({
  serverSideFeatureFlag: jest.fn(),
}));

const mockedServerSideFeatureFlag = jest.mocked(serverSideFeatureFlag);
const originalEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT;

describe("getAgenticAilaEnabled", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ENVIRONMENT = "development";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = originalEnvironment;
  });

  it("returns true when the feature flag is enabled", async () => {
    mockedServerSideFeatureFlag.mockResolvedValue(true);

    await expect(getAgenticAilaEnabled()).resolves.toBe(true);

    expect(mockedServerSideFeatureFlag).toHaveBeenCalledWith(
      AGENTIC_AILA_FEATURE_FLAG,
    );
  });

  it("returns false when the feature flag is disabled", async () => {
    mockedServerSideFeatureFlag.mockResolvedValue(false);

    await expect(getAgenticAilaEnabled()).resolves.toBe(false);
  });

  it("returns false in production without evaluating the flag", async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = "prd";
    mockedServerSideFeatureFlag.mockResolvedValue(true);

    await expect(getAgenticAilaEnabled()).resolves.toBe(false);

    expect(mockedServerSideFeatureFlag).not.toHaveBeenCalled();
  });
});
