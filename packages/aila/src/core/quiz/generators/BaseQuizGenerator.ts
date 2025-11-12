import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import { ElasticLessonQuizLookup } from "../services/LessonSlugQuizLookup";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import type {
  AilaQuizCandidateGenerator,
  LessonSlugQuizLookup,
  QuizQuestionPool,
  QuizQuestionWithSourceData,
  SearchResponseBody,
} from "../interfaces";

const log = aiLogger("aila:quiz");

// Base abstract class for quiz generators
// Generators return structured candidate pools instead of pre-assembled quizzes
export abstract class BaseQuizGenerator implements AilaQuizCandidateGenerator {
  protected client: Client;
  protected quizLookup: LessonSlugQuizLookup;
  protected retrievalService: QuizQuestionRetrievalService;

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
    this.retrievalService = new QuizQuestionRetrievalService();
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
  ): Promise<QuizQuestionWithSourceData[]> {
    return this.retrievalService.retrieveQuestionsByIds(questionUids);
  }

  public async questionArrayFromPlanIdLookUpTable(
    planId: string,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithSourceData[]> {
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
  ): Promise<QuizQuestionWithSourceData[]> {
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
}
