import { getDbConnectivityCode } from "./dbConnectivity";

describe("getDbConnectivityCode", () => {
  it.each(["P1001", "P1002", "P1017", "P2024"])(
    "recognises request errors with code %s",
    (code) => {
      expect(getDbConnectivityCode({ code })).toBe(code);
    },
  );

  it("recognises initialisation errors, which use errorCode", () => {
    expect(getDbConnectivityCode({ errorCode: "P1001" })).toBe("P1001");
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
