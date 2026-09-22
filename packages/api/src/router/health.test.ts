import { healthRouter } from "./health";

jest.mock("@sentry/node", () => ({
  trpcMiddleware: jest.fn(
    () =>
      ({ next }: { next: () => unknown }) =>
        next(),
  ),
}));

describe("health.prismaCheck", () => {
  it("preserves the original database exception as the cause", async () => {
    const error = Object.assign(new Error("Query engine unreachable"), {
      code: "P5006",
    });
    const caller = healthRouter.createCaller({
      prisma: { prompt: { count: jest.fn().mockRejectedValue(error) } },
    } as never);

    await expect(caller.prismaCheck()).rejects.toMatchObject({
      message: "Prisma connection failed",
      code: "INTERNAL_SERVER_ERROR",
      cause: error,
    });
  });
});
