import { selectExportData } from "./selectExportData";

describe("selectExportData", () => {
  const preloaded = {
    link: "https://example.com/preloaded",
    canViewSourceDoc: true,
  };
  const generated = {
    link: "https://example.com/generated",
    canViewSourceDoc: true,
  };
  const error = {
    error: new Error("Database unavailable"),
    message: "Check failed",
  };
  type Result = typeof preloaded | typeof error;

  it("shows a successful generation after a failed preload", () => {
    expect(selectExportData<Result>(error, generated)).toBe(generated);
  });

  it("preserves precedence for a valid preload", () => {
    expect(selectExportData<Result>(preloaded, generated)).toBe(preloaded);
    expect(selectExportData<Result>(preloaded, error)).toBe(preloaded);
  });

  it("keeps the preload error visible until generation produces a result", () => {
    expect(selectExportData<Result>(error, undefined)).toBe(error);
  });

  it("uses generation when no existing export was found", () => {
    expect(selectExportData<Result>(undefined, generated)).toBe(generated);
    expect(selectExportData<Result>(null, generated)).toBe(generated);
  });

  it("shows the latest generation error instead of the earlier preload error", () => {
    const latest = {
      error: new Error("Drive unavailable"),
      message: "Export failed",
    };
    expect(selectExportData<Result>(error, latest)).toBe(latest);
  });
});
