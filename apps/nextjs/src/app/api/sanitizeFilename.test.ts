import { sanitizeFilename } from "./sanitizeFilename";

describe("sanitizeFilename", () => {
  test("should remove special characters", () => {
    const lessonTitle =
      "The econonomy: Boom or Bust? You decide! Let's start, shall we?";
    expect(sanitizeFilename(lessonTitle)).toBe(
      "The econonomy Boom or Bust You decide Lets start shall we",
    );
  });
});
