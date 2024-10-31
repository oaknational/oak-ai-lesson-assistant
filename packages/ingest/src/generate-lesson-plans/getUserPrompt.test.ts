import fs from "node:fs";

import rawLesson from "../fixtures/rawLesson.json";
import type { Captions } from "../zod-schema/zodSchema";
import { getUserPrompt } from "./getUserPrompt";

describe("getUserPrompt", () => {
  it("should return a user prompt, with all source parts by default", () => {
    const captions: Captions = [
      {
        start: 0,
        end: 1,
        text: "These are the",
      },
      {
        start: 1,
        end: 2,
        text: "captions",
      },
    ];
    const result = getUserPrompt({
      rawLesson,
      captions,
    });
    const expected = fs
      .readFileSync(`${__dirname}/../fixtures/userPrompt.txt`, "utf-8")
      .replace(/\r\n/g, "\n");

    expect(result).toBe(expected);
  });
  it("should return a user prompt with only title, subject and key stage", () => {
    const result = getUserPrompt({
      rawLesson,
      captions: [],
      sourcePartsToInclude: "title-subject-key-stage",
    });
    const expected = fs
      .readFileSync(
        `${__dirname}/../fixtures/userPromptTitleSubjectKeyStage.txt`,
        "utf-8",
      )
      .replace(/\r\n/g, "\n");

    expect(result).toBe(expected);
  });
});
