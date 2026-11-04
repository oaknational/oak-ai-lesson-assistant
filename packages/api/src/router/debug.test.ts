import { DEFAULT_RESPONSES_MODEL } from "@oakai/aila/src/lib/agentic-system/constants";

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

  it("returns the model", async () => {
    await expect(createCaller().getAilaOverlayState()).resolves.toEqual({
      model: DEFAULT_RESPONSES_MODEL,
    });
  });

  it("is not available in production", async () => {
    process.env.NEXT_PUBLIC_ENVIRONMENT = "prd";

    await expect(createCaller().getAilaOverlayState()).rejects.toBeDefined();
  });
});
