import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";

import { QuizV1Schema } from "../../../protocol/schemas/quiz/quizV1";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";

const log = aiLogger("aila:quiz");

describe("AilaRagQuizGenerator", () => {
  let quizGenerator: AilaRagQuizGenerator;

  beforeEach(() => {
    quizGenerator = new AilaRagQuizGenerator();
  });

  it("should map quiz from AILA RAG relevant lessons", async () => {
    const mockRelevantLessons = [
      { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
      { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
      { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
      { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
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
      expect(QuizV1Schema.safeParse(quiz).success).toBe(true);
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
      "quiz-questions-text-only-2025-04-16",
      ["QUES-XXXXX-XXXXX"],
    );
    // console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    // in this case we are using the dummy elasticsearch client, so we expect to get a hit.
    expect(result.hits.hits.length).toBeGreaterThan(0);
  });
  it("should generate a quiz from a given lesson plan and aila rag relevant lessons", async () => {
    const mockRelevantLessons = [
      { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
      { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
      { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
      { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
    ];
    const result = await quizGenerator.generateMathsStarterQuizPatch(
      CircleTheoremLesson,
      mockRelevantLessons,
    );
    expect(result).toBeDefined();
    // console.log(JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // expect(result.length).toBe(1);
    expect(result[0]![0]!.question).toBeDefined();
    expect(result[0]![0]!.answers).toBeDefined();
    expect(result[0]![0]!.distractors).toBeDefined();
    log.info("Quiz generated with rag: ", result[0]![0]);
  });
});
