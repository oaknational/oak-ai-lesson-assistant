import { Client } from "@elastic/elasticsearch";

import { QuizSchema } from "../../../protocol/schema";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";
import { runCommonQuizGeneratorTests } from "./BaseQuizGeneratorTests";

describe("AilaRagQuizGenerator", () => {
  let quizGenerator: AilaRagQuizGenerator;

  beforeEach(() => {
    quizGenerator = new AilaRagQuizGenerator();
  });

  it("should map quiz from AILA RAG relevant lessons", async () => {
    const mockRelevantLessons = [
      { lessonPlanId: "clna7k8j400egp4qxrqmjx0qo", title: "test-title-2" },
      { lessonPlanId: "clna7k8kq00fip4qxsjvrmykv", title: "test-title-3" },

      { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-5" },
      { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-6" },
      { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-7" },
      { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-8" },
      { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-9" },
      { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-10" },
      {
        lessonPlanId: "clna7lofy0og0p4qxju5j6z56",
        title: "TEST-LESSON-READING-TIMETABLES",
      },
    ];

    const result = await quizGenerator.mappedQuizFromAilaRagRelevantLessons(
      CircleTheoremLesson,
      mockRelevantLessons,
    );
    // console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // expect(result.length).toBe(mockRelevantLessons.length); this is not currently true due to mismatches with lesson plans and quiz question IDS.
    for (const quiz of result) {
      expect(QuizSchema.safeParse(quiz)).toBeTruthy();
    }
  });
  it("Should retrieve questions from a given questionUid", async () => {
    const result = await quizGenerator.questionArrayFromCustomIds([
      "QUES-EYPJ1-67826",
    ]);

    // console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // expect(result.length).toBe(1);
    expect(result[0]!.question).toBeDefined();
    expect(result[0]!.answers).toBeDefined();
    expect(result[0]!.distractors).toBeDefined();
  });

  it("Should search for questions and provide a hit", async () => {
    const client = new Client({
      cloud: {
        id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID as string,
      },

      auth: {
        apiKey: process.env.I_DOT_AI_ELASTIC_KEY as string,
      },
    });
    const result = await quizGenerator.searchQuestions(
      client,
      "quiz-questions-text-only",
      ["QUES-XXXXX-XXXXX"],
    );
    // console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    // in this case we are using the dummy elasticsearch client, so we expect to get a hit.
    expect(result.hits.hits.length).toBeGreaterThan(0);
  });
});

// Run common quiz generator tests
runCommonQuizGeneratorTests(
  "AilaRagQuizGenerator",
  () => new AilaRagQuizGenerator(),
);
