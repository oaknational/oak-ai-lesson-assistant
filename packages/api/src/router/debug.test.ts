import { getAgenticAilaEnabled } from "../utils/getAgenticAilaEnabled";
import { debugRouter } from "./debug";

jest.mock("@sentry/node", () => ({
  trpcMiddleware: jest.fn(
    () =>
      ({ next }: { next: () => unknown }) =>
        next(),
  ),
}));

jest.mock("../middleware/adminAuth", () => {
  const { publicProcedure } = jest.requireActual("../trpc");

  return {
    adminProcedure: publicProcedure,
  };
});

jest.mock("../utils/getAgenticAilaEnabled", () => ({
  getAgenticAilaEnabled: jest.fn(),
}));

const mockedGetAgenticAilaEnabled = jest.mocked(getAgenticAilaEnabled);
const originalEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT;

const createCaller = () =>
  debugRouter.createCaller({
    auth: { userId: "user_123" },
    prisma: {},
    req: {
      url: "https://example.com/api/trpc/main/debug.getAilaOverlayState",
      headers: new Headers(),
    },
  } as never);

describe("debugRouter.getAilaOverlayState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ENVIRONMENT = "development";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = originalEnvironment;
  });

  it("returns agentic enabled when getAgenticAilaEnabled returns true", async () => {
    mockedGetAgenticAilaEnabled.mockResolvedValue(true);

    await expect(createCaller().getAilaOverlayState()).resolves.toMatchObject({
      agenticEnabled: true,
      models: expect.objectContaining({ chat: expect.any(String) }),
    });
  });

  it("returns agentic disabled when getAgenticAilaEnabled returns false", async () => {
    mockedGetAgenticAilaEnabled.mockResolvedValue(false);

    await expect(createCaller().getAilaOverlayState()).resolves.toMatchObject({
      agenticEnabled: false,
      models: expect.objectContaining({ chat: expect.any(String) }),
    });
  });

  it("does not evaluate agentic state in production", async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = "prd";

    await expect(createCaller().getAilaOverlayState()).rejects.toBeDefined();

    expect(mockedGetAgenticAilaEnabled).not.toHaveBeenCalled();
  });
});
