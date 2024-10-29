import { sanitizeFilename } from "./sanitizeFilename";

describe("sanitizeFilename", () => {
  test("should remove special characters", () => {
    const lessonTitle =
      "The economy: Boom or Bust? You decide! Let's start, shall we?";
    expect(sanitizeFilename(lessonTitle)).toBe(
      "The economy Boom or Bust You decide Lets start shall we",
    );
  });
});
