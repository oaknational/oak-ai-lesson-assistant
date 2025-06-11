// ML-based Quiz Generator
import { aiLogger } from "@oakai/logger";

import type {
  SearchHit,
  SearchHitsMetadata,
} from "@elastic/elasticsearch/lib/api/types";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import type {
  LooseLessonPlan,
  Quiz,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { missingQuizQuestion } from "../fixtures/MissingQuiz";
import type {
  CustomHit,
  CustomSource,
  QuizQuestionWithRawJson,
} from "../interfaces";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

const SemanticSearchSchema = z.object({
  queries: z.array(z.string()).describe("A list of semantic search queries"),
});

export class MLQuizGenerator extends BaseQuizGenerator {
  private async unpackAndSearch(
    lessonPlan: LooseLessonPlan,
  ): Promise<SearchHit<CustomSource>[]> {
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    // Using hybrid search combining BM25 and vector similarity
    const results = await this.searchWithHybrid(
      "oak-vector-2025-04-16",
      qq,
      100,
      0.5, // 50/50 weight between BM25 and vector search
    );
    return results.hits;
  }

  /**
   * Validates the lesson plan
   * @throws {Error} If the lesson plan is invalid
   */
  private isValidLessonPlan(lessonPlan: LooseLessonPlan | null): void {
    if (!lessonPlan) throw new Error("Lesson plan is null");
    // Check for minimum required properties
    if (
      !(
        ("title" in lessonPlan && "keyStage" in lessonPlan)
        // "topic" in lessonPlan
      )
    ) {
      throw new Error("Invalid lesson plan: missing required properties");
    }
  }

  // Our Rag system may retrieve N Questions. We split them into chunks of 6 to conform with the schema. If we have less than 6 questions we pad with questions from the appropriate section of the lesson plan.
  // If there are no questions for padding, we pad with empty questions.
  private splitQuestionsIntoSixAndPad(
    lessonPlan: LooseLessonPlan,
    quizQuestions: QuizQuestionWithRawJson[],
    quizType: QuizPath,
  ): QuizQuestionWithRawJson[][] {
    const quizQuestions2DArray: QuizQuestionWithRawJson[][] = [];
    log.info(
      `MLQuizGenerator: Splitting ${quizQuestions.length} questions into chunks of 6`,
    );
    const chunkSize = 6;

    // const questionsForPadding =
    //   quizType === "/starterQuiz"
    //     ? lessonPlan.starterQuiz
    //     : lessonPlan.exitQuiz;
    // // TODO: GCLOMAX - change this to make it consistent - put it out into fixtures.
    // Split questions into chunks of 6
    for (let i = 0; i < quizQuestions.length; i += chunkSize) {
      const chunk = quizQuestions.slice(i, i + chunkSize);

      // // If the last chunk has less than 6 questions, pad it with questions from lessonPlan, if not use a default question with a message explaining the issue.
      // if (chunk.length < chunkSize && i + chunkSize >= quizQuestions.length) {
      //   const remainingCount = chunkSize - chunk.length;

      //   if (questionsForPadding) {
      //     const paddingQuestions =
      //       questionsForPadding
      //         ?.filter(
      //           (q): q is QuizQuestion =>
      //             !!q?.question && !!q?.answers && !!q?.distractors,
      //         )
      //         .slice(0, remainingCount) ||
      //       Array(remainingCount).fill(missingQuizQuestion);
      //     chunk.push(...paddingQuestions);
      //   } else {
      //     const paddingQuestions: QuizQuestion[] =
      //       Array(remainingCount).fill(missingQuizQuestion);
      //     chunk.push(...paddingQuestions);
      //   }
      // }
      quizQuestions2DArray.push(chunk);
    }

    return quizQuestions2DArray;
  }

  // This should return an array of questions - sometimes there are more than six questions, these are split later.
  private async generateMathsQuizML(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestionWithRawJson[]> {
    this.isValidLessonPlan(lessonPlan);
    const hits = await this.unpackAndSearch(lessonPlan);
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    const customIds = await this.rerankAndExtractCustomIds(hits, qq);
    const quizQuestions = await this.retrieveAndProcessQuestions(customIds);
    return quizQuestions;
  }

  /**
   * Generates semantic search queries from lesson plan content using OpenAI
   */
  public async generateSemanticSearchQueries(
    lessonPlan: LooseLessonPlan,
    quizType: QuizPath,
  ): Promise<z.infer<typeof SemanticSearchSchema>> {
    const unpackedContent = this.unpackLessonPlanForRecommender(lessonPlan);

    const prompt = `Based on the following lesson plan content, generate a series of semantic search queries that could be used to find relevant quiz questions from a question bank for questions from the UK mathematics curriculum.

The search queries should:
- Focus on key concepts, topics, and learning outcomes
- Use educational terminology appropriate for the subject and key stage
- Be specific enough to find relevant questions but broad enough to capture variations
- Include different question types (knowledge, understanding, application)
- Consider prerequisite knowledge and common misconceptions

Lesson plan content:
${unpackedContent}

You should generate queries for a ${quizType} quiz.

Generate a list of 1-3 semantic search queries, each on a new line:`;

    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "o3",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_completion_tokens: 1000,
        response_format: zodResponseFormat(
          SemanticSearchSchema,
          "SemanticSearchQueries",
        ),
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        log.warn(
          "OpenAI returned empty content for semantic search generation",
        );
        return { queries: [] };
      }

      // Parse the content through the schema to ensure type safety
      const parsedContent = SemanticSearchSchema.parse({
        queries: content
          .split("\n")
          .map((query) => query.trim())
          .filter((query) => query.length > 0 && !query.match(/^\d+\.?\s*$/)),
      });

      log.info(
        `Generated ${parsedContent.queries.length} semantic search queries for lesson plan`,
      );
      return parsedContent;
    } catch (error) {
      log.error("Failed to generate semantic search queries:", error);
      throw new Error(
        "Failed to generate semantic search queries from lesson plan",
      );
    }
  }

  // TODO: GCLOMAX - Change for starter and exit quizzes.
  public async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestionWithRawJson[][]> {
    const quiz = await this.generateMathsQuizML(lessonPlan);
    const quiz2DArray = this.splitQuestionsIntoSixAndPad(
      lessonPlan,
      quiz,
      "/starterQuiz",
    );
    log.info(`MLGenerator: Generated ${quiz2DArray.length} starter Quizzes`);
    return quiz2DArray;
  }
  public async generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestionWithRawJson[][]> {
    const quiz: QuizQuestionWithRawJson[] =
      await this.generateMathsQuizML(lessonPlan);
    const quiz2DArray = this.splitQuestionsIntoSixAndPad(
      lessonPlan,
      quiz,
      "/exitQuiz",
    );
    log.info(`MLGenerator: Generated ${quiz2DArray.length} exit questions`);
    return quiz2DArray;
  }
}
