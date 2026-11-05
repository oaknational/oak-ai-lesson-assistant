import { getDbConnectivityCode } from "./dbConnectivity";

describe("getDbConnectivityCode", () => {
  it.each(["P1001", "P1002", "P1011", "P1017", "P2024", "P2037"])(
    "recognises request errors with Prisma code %s",
    (code) => {
      expect(getDbConnectivityCode({ code })).toBe(code);
    },
  );

  it("recognises initialisation errors, which use errorCode", () => {
    expect(getDbConnectivityCode({ errorCode: "P1001" })).toBe("P1001");
  });

  it("recognises network codes that the pg adapter passes through", () => {
    expect(getDbConnectivityCode({ code: "ECONNREFUSED" })).toBe(
      "ECONNREFUSED",
    );
  });

  it.each([
    [
      "Connection terminated due to connection timeout",
      "pg-connection-timeout",
    ],
    ["Connection terminated unexpectedly", "pg-connection-terminated"],
    ["timeout exceeded when trying to connect", "pg-pool-exhausted"],
  ])("recognises the pg error %j by message", (message, label) => {
    expect(getDbConnectivityCode(new Error(message))).toBe(label);
  });

  it("recognises a connectivity error through a cause", () => {
    const error = new Error("RPC failed", { cause: { code: "P1017" } });
    expect(getDbConnectivityCode(error)).toBe("P1017");
  });

  it.each([
    { code: "P2002" },
    { errorCode: "P1012" },
    { code: 1001 },
    { message: "An unrelated query mentions P1001" },
    { message: "Connection terminated due to connection timeout, maybe" },
    null,
  ])("leaves unrelated or malformed errors alone: %j", (error) => {
    expect(getDbConnectivityCode(error)).toBeUndefined();
  });

  it("terminates on a cyclic cause chain", () => {
    const error = new Error("cycle");
    error.cause = error;
    expect(getDbConnectivityCode(error)).toBeUndefined();
  });
});
