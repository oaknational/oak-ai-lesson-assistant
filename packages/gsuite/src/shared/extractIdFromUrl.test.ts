import extractFileIdFromUrl from "./extractIdFromUrl";

describe("extractFileIdFromUrl", () => {
  test("extracts file ID from presentation docs URL", () => {
    const url =
      "https://docs.google.com/presentation/d/1A2B3C4D5E6F7G8H9I0J/edit";
    const fileId = extractFileIdFromUrl(url);
    expect(fileId).toBe("1A2B3C4D5E6F7G8H9I0J");
  });
  test("extracts file ID from standard Google Drive URL", () => {
    const url = "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view";
    const fileId = extractFileIdFromUrl(url);
    expect(fileId).toBe("1A2B3C4D5E6F7G8H9I0J");
  });
  test("extracts file ID from standard Google Drive URL", () => {
    const url = "https://drive.google.com/open?id=1A2B3C4D5E6F7G8H9I0J";
    const fileId = extractFileIdFromUrl(url);
    expect(fileId).toBe("1A2B3C4D5E6F7G8H9I0J");
  });
});
test("throws error for invalid URL", () => {
  const url = "https://invalid.url.com/file/1";
  expect(() => extractFileIdFromUrl(url)).toThrow(
    `Invalid Google Drive URL format: ${url}`,
  );
});
