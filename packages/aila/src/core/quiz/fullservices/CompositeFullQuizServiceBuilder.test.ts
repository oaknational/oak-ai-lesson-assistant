/* eslint-disable @cspell/spellchecker */
import { aiLogger } from "@oakai/logger";

import type { AilaRagRelevantLesson } from "../../../protocol/schema";
import {
  CircleTheoremLesson,
  CircleTheoremLessonWithoutBasedOn,
} from "../fixtures/CircleTheoremsExampleOutput";
import { testRatingSchema } from "../rerankers/RerankerStructuredOutputSchema";
import type { QuizBuilderSettings } from "../schema";
import { CompositeFullQuizServiceBuilder } from "./CompositeFullQuizServiceBuilder";

const log = aiLogger("aila");

const shouldSkipTests = process.env.TEST_QUIZZES === "false";

(shouldSkipTests ? describe.skip : describe)(
  "CompositeFullQuizServiceBuilder",
  () => {
    jest.setTimeout(60000);

    it("should build a CompositeFullQuizService", () => {
      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["basedOnRag"],
      };
      const service = builder.build(settings);
      expect(service).toBeDefined();
      expect(service.quizSelector).toBeDefined();
      expect(service.quizReranker).toBeDefined();
      expect(service.quizGenerators).toBeDefined();
      expect(service.quizGenerators.length).toBe(1);
      expect(service.quizGenerators[0]).toBeDefined();
    });

    it("Should work with a simple quiz selector", async () => {
      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["basedOnRag"],
      };
      const service = builder.build(settings);
      const quiz = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLesson,
      );
      expect(quiz).toBeDefined();
      expect(quiz.version).toBe("v3");
      expect(quiz.questions.length).toBeGreaterThan(0);
      expect(quiz.questions[0]?.question).toBeDefined();
      expect(quiz.questions[0]?.questionType).toBeDefined();
      log.info(JSON.stringify(quiz, null, 2));
    });

    it("Should work with a BasedOnRag quiz generator", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        // { lessonPlanId: "clna7k8j400egp4qxrqmjx0qo", title: "test-title-2" },
        { lessonPlanId: "clna7k8kq00fip4qxsjvrmykv", title: "test-title-3" },
        { lessonPlanId: "clna7k8pq00j1p4qxa9euac1c", title: "test-title-4" },
        { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-5" },
        { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-6" },
        { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-7" },
        { lessonPlanId: "clna7k8zr00qfp4qx44fdvikl", title: "test-title-8" },
        { lessonPlanId: "clna7k93700sap4qx741wdrz4", title: "test-title-9" },
        { lessonPlanId: "clna7k98j00vup4qx9nyfjtpm", title: "test-title-10" },
      ];

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["basedOnRag"],
      };
      const service = builder.build(settings);
      const quiz = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLesson,
        mockRelevantLessons,
      );
      expect(quiz).toBeDefined();
      expect(quiz.version).toBe("v3");
      expect(quiz.questions.length).toBeGreaterThan(0);
      expect(quiz.questions[0]?.question).toBeDefined();
      expect(quiz.questions[0]?.questionType).toBeDefined();
      log.info(JSON.stringify(quiz, null, 2));
    });
    it("Should work with a rag quiz generator", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
        { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
        { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
        { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
      ];

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["rag"],
      };
      const service = builder.build(settings);
      const quiz = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLesson,
        mockRelevantLessons,
      );
      expect(quiz).toBeDefined();
      expect(quiz.version).toBe("v3");
      expect(quiz.questions.length).toBeGreaterThan(0);
      expect(quiz.questions[0]?.question).toBeDefined();
      expect(quiz.questions[0]?.questionType).toBeDefined();
      log.info("Quiz generated with rag and return first: ", quiz);
      log.info(JSON.stringify(quiz, null, 2));
    });

    it("Should work with override functionality", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
        { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
        { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
        { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
      ];

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["basedOnRag", "rag"], // Include both generators to test override behavior
      };
      const service = builder.build(settings);

      // Test with override enabled
      const quizWithOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLesson,
        mockRelevantLessons,
        true, // Enable override
      );

      expect(quizWithOverride).toBeDefined();
      expect(quizWithOverride.version).toBe("v3");
      expect(quizWithOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithOverride.questions[0]?.question).toBeDefined();
      expect(quizWithOverride.questions[0]?.questionType).toBeDefined();
      log.info("Quiz generated with override: ", quizWithOverride);

      // Test with override disabled (should use default behavior)
      const quizWithoutOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLesson,
        mockRelevantLessons,
        false, // Disable override
      );

      expect(quizWithoutOverride).toBeDefined();
      expect(quizWithoutOverride.version).toBe("v3");
      expect(quizWithoutOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithoutOverride.questions[0]?.question).toBeDefined();
      expect(quizWithoutOverride.questions[0]?.questionType).toBeDefined();

      log.info("Quiz generated with override: ", quizWithOverride);
      log.info("Quiz generated without override: ", quizWithoutOverride);
    });

    it("Should work with override functionality when no basedOn lesson is present", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
        { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
        { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
        { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
      ];

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["basedOnRag", "rag"], // Only include rag generator to test fallback behavior
      };
      const service = builder.build(settings);

      // Test with override enabled but no basedOn lesson
      const quizWithOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLessonWithoutBasedOn,
        mockRelevantLessons,
        true, // Enable override
      );

      expect(quizWithOverride).toBeDefined();
      expect(quizWithOverride.version).toBe("v3");
      expect(quizWithOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithOverride.questions[0]?.question).toBeDefined();
      expect(quizWithOverride.questions[0]?.questionType).toBeDefined();
      log.info(
        "Quiz generated with override but no basedOn lesson present: ",
        quizWithOverride,
      );

      // Test with override disabled (should use default behavior)
      const quizWithoutOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLessonWithoutBasedOn,
        mockRelevantLessons,
        false, // Disable override
      );

      expect(quizWithoutOverride).toBeDefined();
      expect(quizWithoutOverride.version).toBe("v3");
      expect(quizWithoutOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithoutOverride.questions[0]?.question).toBeDefined();
      expect(quizWithoutOverride.questions[0]?.questionType).toBeDefined();

      log.info(
        "Quiz generated without override and no basedOn lesson: ",
        quizWithoutOverride,
      );
    });

    it("Should work with override functionality when no basedOn lesson is present and with ml generator", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
        { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
        { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
        { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
      ];

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["basedOnRag", "rag", "ml"], // Only include rag generator to test fallback behavior
      };
      const service = builder.build(settings);

      // Test with override enabled but no basedOn lesson
      const quizWithOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLessonWithoutBasedOn,
        mockRelevantLessons,
        true, // Enable override
      );

      expect(quizWithOverride).toBeDefined();
      expect(quizWithOverride.version).toBe("v3");
      expect(quizWithOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithOverride.questions[0]?.question).toBeDefined();
      expect(quizWithOverride.questions[0]?.questionType).toBeDefined();
      log.info(
        "Quiz generated with override but no basedOn lesson present: ",
        quizWithOverride,
      );

      // Test with override disabled (should use default behavior)
      const quizWithoutOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLessonWithoutBasedOn,
        mockRelevantLessons,
        false, // Disable override
      );

      expect(quizWithoutOverride).toBeDefined();
      expect(quizWithoutOverride.version).toBe("v3");
      expect(quizWithoutOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithoutOverride.questions[0]?.question).toBeDefined();
      expect(quizWithoutOverride.questions[0]?.questionType).toBeDefined();

      log.info(
        "Quiz generated without override and no basedOn lesson: ",
        quizWithoutOverride,
      );
    });

    it("Should work with override functionality when no basedOn lesson is present AND no baseOn generator is present", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
        { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
        { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
        { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
      ];

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "return-first",
        quizGenerators: ["rag"], // Only include rag generator to test fallback behavior
      };
      const service = builder.build(settings);

      // Test with override enabled but no basedOn lesson
      const quizWithOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLessonWithoutBasedOn,
        mockRelevantLessons,
        true, // Enable override
      );

      expect(quizWithOverride).toBeDefined();
      expect(quizWithOverride.version).toBe("v3");
      expect(quizWithOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithOverride.questions[0]?.question).toBeDefined();
      expect(quizWithOverride.questions[0]?.questionType).toBeDefined();
      log.info(
        "Quiz generated with override but no basedOn lesson present, only rag generator: ",
        quizWithOverride,
      );
    });
    it("Should use a schema reranker with override functionality when no basedOn lesson is present AND no baseOn generator is present", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        { lessonPlanId: "0anVg2hmAKl2YwsPjUXL0", title: "test-title-2" },
        { lessonPlanId: "08_VNQ-oPRwaXs7hOSHtL", title: "test-title-3" },
        { lessonPlanId: "0bz8ZgPlNRRPb5AT5hhqO", title: "test-title-4" },
        { lessonPlanId: "0ChBXkONXh8IOVS00iTlm", title: "test-title-5" },
      ];

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "schema-reranker",
        quizGenerators: ["basedOnRag", "rag"], // Only include rag generator to test fallback behavior
      };
      const service = builder.build(settings);

      // Test with override enabled but no basedOn lesson
      const quizWithOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLessonWithoutBasedOn,
        mockRelevantLessons,
        false, // Enable override
      );

      expect(quizWithOverride).toBeDefined();
      expect(quizWithOverride.version).toBe("v3");
      expect(quizWithOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithOverride.questions[0]?.question).toBeDefined();
      expect(quizWithOverride.questions[0]?.questionType).toBeDefined();
      log.info(
        "Quiz generated with override but no basedOn lesson present, only rag generator and schema reranker: ",
        quizWithOverride,
      );
    });
    it("Test data from a known rag lesson.", async () => {
      const mockRelevantLessons: AilaRagRelevantLesson[] = [
        // { lessonPlanId: "OmUHQwwm_XZpE--c1whvX", title: "test-title-2" },
        // { lessonPlanId: "5uHXXJq_3aL7ygK_Dm_UI", title: "test-title-3" },
        { lessonPlanId: "2Z3lzRDiGDqxzmCG9jOX3", title: "test-title-4" },
        { lessonPlanId: "cFB1BHLO51iY3Y0_ldgVE", title: "test-title-5" },
        { lessonPlanId: "a8LpF832R0Iep5Gp7FJF1", title: "test-title-6" },
      ];
      // clyegoy2104u68zxky2w8g2ls

      const builder = new CompositeFullQuizServiceBuilder();
      const settings: QuizBuilderSettings = {
        quizRatingSchema: testRatingSchema,
        quizSelector: "simple",
        quizReranker: "schema-reranker",
        quizGenerators: ["rag"], // Only include rag generator to test fallback behavior
      };
      const service = builder.build(settings);

      // Test with override enabled but no basedOn lesson
      const quizWithOverride = await service.createBestQuiz(
        "/starterQuiz",
        CircleTheoremLessonWithoutBasedOn,
        mockRelevantLessons,
        false, // Enable override
      );

      expect(quizWithOverride).toBeDefined();
      expect(quizWithOverride.version).toBe("v3");
      expect(quizWithOverride.questions.length).toBeGreaterThan(0);
      expect(quizWithOverride.questions[0]?.question).toBeDefined();
      expect(quizWithOverride.questions[0]?.questionType).toBeDefined();
      log.info(
        "Edge case test that works in test env but not upon deployment. ",
        quizWithOverride,
      );
    });
  },
);
