import { getAccelerateConnectivityCode } from "./accelerateConnectivity";

const wrapped = (body: unknown) => ({
  code: "P5000",
  message: `Invalid prisma.lessonExport.findFirst() invocation:\nThis request could not be understood by the server: ${JSON.stringify({ type: "UnknownJsonError", body })} (The request id was: a3edc5c43d91386e)`,
});

describe("getAccelerateConnectivityCode", () => {
  it.each(["P6008", "P5010"])("recognises direct %s errors", (code) => {
    expect(getAccelerateConnectivityCode({ code })).toBe(code);
  });

  it("recognises the production P5000 envelope through a cause", () => {
    const error = new Error("RPC failed", {
      cause: wrapped({ code: "P6008", message: "Connection failed" }),
    });
    expect(getAccelerateConnectivityCode(error)).toBe("P6008");
  });

  it.each([
    wrapped({ code: "P6009" }),
    { code: "P5000", message: "An unrelated query mentions P6008" },
    {
      code: "P5000",
      message: "This request could not be understood by the server: {bad JSON",
    },
    {
      code: "P5000",
      message:
        'This request could not be understood by the server: {"type":"Other","body":{"code":"P6008"}}',
    },
    null,
  ])("leaves unrelated or malformed errors alone: %j", (error) => {
    expect(getAccelerateConnectivityCode(error)).toBeUndefined();
  });

  it("terminates on a cyclic cause chain", () => {
    const error = new Error("cycle");
    error.cause = error;
    expect(getAccelerateConnectivityCode(error)).toBeUndefined();
  });
});

describe("unreachable Accelerate query engine", () => {
  const wrappedEngineError = (message: string, code = "P6000") => ({
    code: "P5006",
    message: `Invalid prisma.prompt.count() invocation:\nUnknown server error: ${JSON.stringify({ type: "UnknownJsonError", body: { code, message } })} (The request id was: a3edc15008d77c4d)`,
  });

  it("recognises the observed 522 response through a health-check cause", () => {
    const error = new Error("Prisma connection failed", {
      cause: wrappedEngineError("Query Engine instance was unreachable: 522"),
    });
    expect(getAccelerateConnectivityCode(error)).toBe("P6000");
  });

  it.each([
    wrappedEngineError("An unrelated server error"),
    wrappedEngineError("Query Engine instance was unreachable: 522", "P6009"),
    { code: "P5006", message: "Unknown server error: {bad JSON" },
    { code: "P6000", message: "An unrelated server error" },
  ])("does not group other server errors as connectivity failures", (error) => {
    expect(getAccelerateConnectivityCode(error)).toBeUndefined();
  });
});
