import {
  lessonContentFixture,
  syntheticUnitvariantLessonsFixture,
} from "@oaknational/oak-curriculum-schema";

import { lessonOverviewQuery, lessonOverviewQueryCanonical } from "./queries";
import {
  lessonAdaptContentSchema,
  lessonBrowseDataByKsSchema,
  lessonContentSchema,
} from "./schemas";

// The fields a query requests for one of its results, e.g. `content`
function selectedFields(query: string, alias: string): string[] {
  const selection = new RegExp(`${alias}: \\w+\\([^)]*\\) \\{([^}]*)\\}`).exec(
    query,
  )?.[1];
  if (!selection) {
    throw new Error(`No ${alias} selection in query`);
  }
  return selection.trim().split(/\s+/);
}

// A response shaped like the query's: only the fields it requests
function queryShaped(value: object, fields: string[]) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => fields.includes(key)),
  );
}

// Image metadata that curriculum-schema 1 accepted and version 2 rejects
const nonEmptyMetadata = [{ attribution: "Oak National Academy" }];

// Quiz questions as lesson content returned them before curriculum-schema 2:
// no _state, a short answer that includes an image, and images with non-empty
// metadata arrays
const legacyShortAnswerQuestion = {
  question_id: 2,
  question_uid: "question-2",
  question_type: "short-answer",
  question_stem: [{ type: "text", text: "What is shown in the image?" }],
  answers: {
    "short-answer": [
      {
        answer: [
          { type: "text", text: "A volcano" },
          {
            type: "image",
            image_object: {
              secure_url: "https://example.com/volcano.png",
              metadata: nonEmptyMetadata,
            },
          },
        ],
        answer_is_default: true,
      },
    ],
  },
  order: 2,
};

const legacyMultipleChoiceQuestion = {
  question_id: 3,
  question_uid: "question-3",
  question_type: "multiple-choice",
  question_stem: [
    { type: "text", text: "Which shape is shown?" },
    {
      type: "image",
      image_object: {
        secure_url: "https://example.com/shape.png",
        metadata: nonEmptyMetadata,
      },
    },
  ],
  answers: {
    "multiple-choice": [
      {
        answer: [
          {
            type: "image",
            image_object: {
              secure_url: "https://example.com/square.png",
              metadata: nonEmptyMetadata,
            },
          },
        ],
        answer_is_correct: true,
      },
    ],
  },
  order: 3,
};

// Text with characters curriculum-schema 2 rejects outside code and maths
const textWithControlCharacters = "1\\2 is a half\nso\tis 2/4";

describe.each([
  ["lessonOverviewQuery", lessonOverviewQuery],
  ["lessonOverviewQueryCanonical", lessonOverviewQueryCanonical],
])("parsing %s results", (_name, query) => {
  it("accepts browse data with only the fields the query requests", () => {
    const browseData = queryShaped(
      syntheticUnitvariantLessonsFixture(),
      selectedFields(query, "browseData"),
    );

    expect(lessonBrowseDataByKsSchema.safeParse(browseData).error).toBe(
      undefined,
    );
  });

  it("accepts lesson content with legacy quiz questions", () => {
    const fixture = lessonContentFixture();
    const content = queryShaped(
      {
        ...fixture,
        starter_quiz: [legacyShortAnswerQuestion, legacyMultipleChoiceQuestion],
        exit_quiz: fixture.exit_quiz?.map(
          ({ _state, ...question }) => question,
        ),
      },
      selectedFields(query, "content"),
    );

    const parsed = lessonContentSchema.safeParse(content);

    expect(parsed.error).toBe(undefined);
    expect(parsed.data?.starter_quiz).toHaveLength(2);
  });

  it.each([
    ["lessonContentSchema", lessonContentSchema],
    ["lessonAdaptContentSchema", lessonAdaptContentSchema],
  ])(
    "%s accepts lesson text with tabs, newlines and backslashes",
    (_schemaName, schema) => {
      const content = queryShaped(
        {
          ...lessonContentFixture(),
          lesson_keywords: [
            {
              keyword: textWithControlCharacters,
              description: textWithControlCharacters,
            },
          ],
          misconceptions_and_common_mistakes: [
            {
              misconception: textWithControlCharacters,
              response: textWithControlCharacters,
            },
          ],
          equipment_and_resources: [{ equipment: textWithControlCharacters }],
        },
        selectedFields(query, "content"),
      );

      expect(schema.safeParse(content).error).toBe(undefined);
    },
  );
});
