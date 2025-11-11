import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";
import invariant from "tiny-invariant";
import { z } from "zod";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
  QuizV1Question,
} from "../../../protocol/schema";
import { QuizV1QuestionSchema } from "../../../protocol/schema";
import type { HasuraQuiz } from "../../../protocol/schemas/quiz/rawQuiz";
import { ElasticLessonQuizLookup } from "../LessonSlugQuizMapping";
import type {
  AilaQuizCandidateGenerator,
  LessonSlugQuizLookup,
  QuizQuestionPool,
  QuizQuestionTextOnlySource,
  QuizQuestionWithRawJson,
  SearchResponseBody,
} from "../interfaces";

const log = aiLogger("aila:quiz");

// Base abstract class for quiz generators
// Generators return structured candidate pools instead of pre-assembled quizzes
export abstract class BaseQuizGenerator implements AilaQuizCandidateGenerator {
  protected client: Client;
  protected quizLookup: LessonSlugQuizLookup;

  constructor() {
    if (
      !process.env.I_DOT_AI_ELASTIC_CLOUD_ID ||
      !process.env.I_DOT_AI_ELASTIC_KEY
    ) {
      throw new Error(
        "Environment variables for Elastic Cloud ID and API Key must be set",
      );
    }
    this.client = new Client({
      cloud: {
        id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID,
      },

      auth: {
        apiKey: process.env.I_DOT_AI_ELASTIC_KEY,
      },
    });

    this.quizLookup = new ElasticLessonQuizLookup();
  }

  abstract generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]>;

  abstract generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]>;

  public async getLessonSlugFromPlanId(planId: string): Promise<string | null> {
    try {
      const result = await prisma.ragLessonPlan.findUnique({
        where: { id: planId },
      });

      if (!result) {
        log.warn("Lesson plan could not be retrieved for planId: ", planId);
        return null;
      }
      return result.oakLessonSlug;
    } catch (error) {
      log.error("Error fetching lesson slug:", error);
      return null;
    }
  }

  public async lessonSlugToQuestionIdsLookupTable(
    lessonSlug: string,
    quizType: QuizPath,
  ): Promise<string[]> {
    if (quizType === "/starterQuiz") {
      return await this.quizLookup.getStarterQuiz(lessonSlug);
    } else if (quizType === "/exitQuiz") {
      return await this.quizLookup.getExitQuiz(lessonSlug);
    }
    throw new Error("Invalid quiz type");
  }

  public async questionArrayFromCustomIds(
    questionUids: string[],
  ): Promise<QuizQuestionWithRawJson[]> {
    const response = await this.client.search<QuizQuestionTextOnlySource>({
      index: "quiz-questions-text-only-2025-04-16",
      body: {
        query: {
          bool: {
            must: [
              {
                terms: {
                  "metadata.questionUid.keyword": questionUids,
                },
              },
            ],
          },
        },
      },
    });
    if (!response.hits.hits[0]?._source) {
      log.error("No questions found for questionUids: ", questionUids);
      return Promise.resolve([]);
    } else {
      // Gives us an array of quiz questions or null, which are then filtered out.
      // We convert the raw json to a quiz question with raw json object
      const filteredQuizQuestions: QuizQuestionWithRawJson[] =
        response.hits.hits
          .map((hit) => {
            if (!hit._source) {
              log.error("Hit source is undefined");
              return null;
            }
            // const quizQuestion = this.parseQuizQuestion(hit._source.text);
            const quizQuestion = this.parseQuizQuestionWithRawJson(
              hit._source.text,
              hit._source.metadata.raw_json,
            );
            return quizQuestion;
          })
          .filter((item): item is QuizQuestionWithRawJson => item !== null);
      return Promise.resolve(filteredQuizQuestions);
    }
  }

  public async questionArrayFromPlanIdLookUpTable(
    planId: string,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithRawJson[]> {
    const lessonSlug = await this.getLessonSlugFromPlanId(planId);
    if (!lessonSlug) {
      throw new Error("Lesson slug not found for planId: " + planId);
    }
    const questionIds = await this.lessonSlugToQuestionIdsLookupTable(
      lessonSlug,
      quizType,
    );

    const quizQuestions = await this.questionArrayFromCustomIds(questionIds);
    return quizQuestions;
  }

  public async questionArrayFromPlanId(
    planId: string,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithRawJson[]> {
    return await this.questionArrayFromPlanIdLookUpTable(planId, quizType);
  }

  public async searchQuestions<T>(
    client: Client,
    index: string,
    questionUids: string[],
  ): Promise<SearchResponseBody<T>> {
    // Retrieves questions by questionUids
    const response = await client.search<T>({
      index: index,
      body: {
        query: {
          bool: {
            must: [
              {
                terms: {
                  "metadata.questionUid.keyword": questionUids,
                },
              },
            ],
          },
        },
      },
    });
    return response;
  }

  private parseQuizQuestion(jsonString: string): QuizV1Question | null {
    try {
      const data = JSON.parse(jsonString);

      return QuizV1QuestionSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        log.error("Validation error:", error.errors);
      } else if (error instanceof SyntaxError) {
        log.error(
          "OFFENDING JSON STRING: ",
          JSON.stringify(jsonString, null, 2),
        );
        log.error("JSON parsing error:", error.message);
      } else {
        log.error("An unexpected error occurred:", error);
      }
      return null;
    }
  }
  private parseQuizQuestionWithRawJson(
    jsonString: string,
    rawQuizString: string,
  ): QuizQuestionWithRawJson | null {
    const quizQuestion = this.parseQuizQuestion(jsonString);
    if (!quizQuestion) {
      return null;
    }
    if (!rawQuizString) {
      return null;
    }
    const parsedRawQuiz = JSON.parse(rawQuizString) as HasuraQuiz;
    invariant(parsedRawQuiz, "Parsed raw quiz is null");

    // Handle case where rawQuiz is a single object instead of an array
    const normalizedRawQuiz = Array.isArray(parsedRawQuiz)
      ? parsedRawQuiz
      : [parsedRawQuiz];

    return {
      ...quizQuestion,
      rawQuiz: normalizedRawQuiz,
    };
  }
}
