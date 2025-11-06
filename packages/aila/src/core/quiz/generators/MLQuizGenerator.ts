// ML-based Quiz Generator
import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";
import type {
  SearchHit,
  SearchHitsMetadata,
} from "@elastic/elasticsearch/lib/api/types";
import { CohereClient } from "cohere-ai";
import type { RerankResponseResultsItem } from "cohere-ai/api/types";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import invariant from "tiny-invariant";
import { z } from "zod";

import type {
  PartialLessonPlan,
  QuizPath,
  QuizV1Question,
} from "../../../protocol/schema";
import { QuizV1QuestionSchema } from "../../../protocol/schema";
import type { HasuraQuiz } from "../../../protocol/schemas/quiz/rawQuiz";
import { missingQuizQuestion } from "../fixtures/MissingQuiz";
import type {
  CustomHit,
  CustomSource,
  QuizQuestionWithRawJson,
  SimplifiedResult,
} from "../interfaces";
import { CohereReranker } from "../rerankers";
import type { SearchResponseBody } from "../types";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

const SemanticSearchSchema = z.object({
  queries: z.array(z.string()).describe("A list of semantic search queries"),
});

function quizSpecificInstruction(quizType: QuizPath) {
  if (quizType === "/starterQuiz") {
    return `The purpose of the starter quiz is to assess the prior knowledge of the students, identify misconceptions, and reactivate prior knowledge. Please consider alignment with the "prior knowledge" section of the lesson plan.`;
  } else if (quizType === "/exitQuiz") {
    return `The purpose of the exit quiz is to assess the learning outcomes of the students, identify misconceptions, and consolidate the learning. Please consider alignment with the "key learning points" and "learning outcome" sections of the lesson plan.`;
  }
  throw new Error(`Unsupported quiz type: ${quizType as string}`);
}

export class MLQuizGenerator extends BaseQuizGenerator {
  protected client: Client;
  protected cohere: CohereClient;
  public openai: OpenAI;
  protected rerankService: CohereReranker;

  constructor() {
    super();

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

    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY as string,
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.rerankService = new CohereReranker();
  }

  /**
   * Validates the lesson plan
   * @throws {Error} If the lesson plan is invalid
   */
  private isValidLessonPlan(lessonPlan: PartialLessonPlan | null): void {
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
    lessonPlan: PartialLessonPlan,
    quizQuestions: QuizQuestionWithRawJson[],
    quizType: QuizPath,
  ): QuizQuestionWithRawJson[][] {
    const quizQuestions2DArray: QuizQuestionWithRawJson[][] = [];
    log.info(
      `MLQuizGenerator: Splitting ${quizQuestions.length} questions into chunks of 6`,
    );
    const chunkSize = 6;

    for (let i = 0; i < quizQuestions.length; i += chunkSize) {
      const chunk = quizQuestions.slice(i, i + chunkSize);
      quizQuestions2DArray.push(chunk);
    }

    return quizQuestions2DArray;
  }

  public async generateMathsQuizML(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithRawJson[]> {
    // Using hybrid search combining BM25 and vector similarity
    const semanticQueries: z.infer<typeof SemanticSearchSchema> =
      await this.generateSemanticSearchQueries(lessonPlan, quizType);

    const concatenatedQueries: string = semanticQueries.queries.join(" ");

    const results = await this.searchWithHybrid(
      "oak-vector-2025-04-16",
      concatenatedQueries,
      100,
      0.5, // 50/50 weight between BM25 and vector search
    );

    // const quizQuestions = await this.retrieveAndProcessQuestions(semanticQueries);
    const customIds = await this.rerankAndExtractCustomIds(
      results.hits,
      concatenatedQueries,
    );
    const quizQuestions = await this.retrieveAndProcessQuestions(customIds);
    return quizQuestions;
  }

  /**
   * Generates semantic search queries from lesson plan content using OpenAI
   */
  public async generateSemanticSearchQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<z.infer<typeof SemanticSearchSchema>> {
    const unpackedContent = unpackLessonPlanForPrompt(lessonPlan);

    const prompt = `Based on the following lesson plan content, generate a series of semantic search queries that could be used to find relevant quiz questions from a question bank for questions from the UK mathematics curriculum.

The search queries should:
- Focus on key concepts, topics, and learning outcomes
- Use educational terminology appropriate for the subject and key stage
- Be specific enough to find relevant questions but broad enough to capture variations
- Include different question types (knowledge, understanding, application)
- Consider prerequisite knowledge and common misconceptions

Lesson plan content:
${unpackedContent}

You should generate queries for a ${quizType} quiz. ${quizSpecificInstruction(quizType)}

Generate a list of 1-3 semantic search queries`;

    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "gpt-4.1",
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
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionWithRawJson[][]> {
    const quiz = await this.generateMathsQuizML(lessonPlan, "/starterQuiz");
    const quiz2DArray = this.splitQuestionsIntoSixAndPad(
      lessonPlan,
      quiz,
      "/starterQuiz",
    );
    log.info(`MLGenerator: Generated ${quiz2DArray.length} starter Quizzes`);
    return quiz2DArray;
  }
  public async generateMathsExitQuizPatch(
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionWithRawJson[][]> {
    const quiz: QuizQuestionWithRawJson[] = await this.generateMathsQuizML(
      lessonPlan,
      "/exitQuiz",
    );
    const quiz2DArray = this.splitQuestionsIntoSixAndPad(
      lessonPlan,
      quiz,
      "/exitQuiz",
    );
    log.info(`MLGenerator: Generated ${quiz2DArray.length} exit questions`);
    return quiz2DArray;
  }

  // === ML-specific search and processing methods ===

  protected transformHits(hits: SearchHit<CustomSource>[]): SimplifiedResult[] {
    return hits
      .map((hit) => {
        const source = hit._source;

        if (!source) {
          log.warn("Hit source is undefined:", hit);
          return null;
        }

        if (
          typeof source.text !== "string" ||
          typeof source.questionUid !== "string"
        ) {
          log.warn("Hit is missing required fields:", hit);
          return null;
        }

        return {
          text: source.text,
          custom_id: source.questionUid,
        };
      })
      .filter((item): item is SimplifiedResult => item !== null);
  }

  protected async searchWithBM25(
    index: string,
    field: string,
    query: string,
    _size: number = 10,
  ): Promise<SearchHitsMetadata<CustomSource>> {
    try {
      log.info(`Searching index: ${index}, field: ${field}, query: ${query}`);
      const response = await this.client.search<CustomSource>({
        index: "oak-vector-2025-04-16",
        query: {
          bool: {
            must: [{ match: { text: query } }],
            filter: [{ term: { isLegacy: false } }],
          },
        },
      });
      log.info(`search response found ${response.hits.hits.length} hits`);
      if (!response.hits) {
        throw new Error("No hits property in the search response");
      }

      return response.hits;
    } catch (error) {
      log.error("Error searching Elasticsearch:", error);
      if (error instanceof Error) {
        log.error("Error message:", error.message);
        log.error("Error stack:", error.stack);
      }
      throw error;
    }
  }

  public async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
        encoding_format: "float",
        dimensions: 768,
      });

      return response.data[0]?.embedding || [];
    } catch (error) {
      log.error("Error creating embedding:", error);
      throw error;
    }
  }

  protected async searchWithHybrid(
    index: string,
    query: string,
    size: number = 100,
    hybridWeight: number = 0.5,
  ): Promise<SearchHitsMetadata<CustomSource>> {
    try {
      log.info(`Performing hybrid search on index: ${index}, query: ${query}`);

      const queryEmbedding = await this.createEmbedding(query);

      const response = await this.client.search<CustomSource>({
        index,
        size,
        query: {
          bool: {
            must: [
              {
                function_score: {
                  query: {
                    bool: {
                      should: [
                        {
                          match: {
                            text: {
                              query,
                              boost: 1 - hybridWeight,
                            },
                          },
                        },
                        {
                          script_score: {
                            query: { match_all: {} },
                            script: {
                              source: `
                                if (doc['embedding'].size() == 0) {
                                  return 0;
                                }
                                return cosineSimilarity(params.query_vector, 'embedding') + 1.0;
                              `,
                              params: {
                                query_vector: queryEmbedding,
                              },
                            },
                            boost: hybridWeight,
                          },
                        },
                      ],
                    },
                  },
                  boost_mode: "sum",
                },
              },
            ],
            filter: [{ term: { isLegacy: false } }],
          },
        },
      });

      if (!response.hits) {
        throw new Error("No hits property in the search response");
      }

      log.info(`Hybrid search found ${response.hits.hits.length} hits`);

      return response.hits;
    } catch (error) {
      log.error("Error performing hybrid search:", error);
      if (error instanceof Error) {
        log.error("Error message:", error.message);
        log.error("Error stack:", error.stack);
      }
      throw error;
    }
  }

  protected async rerankDocuments(
    query: string,
    docs: SimplifiedResult[],
    topN: number = 10,
  ) {
    if (docs.length === 0) {
      log.error("No documents to rerank");
      return [];
    }

    try {
      const jsonDocs = docs.map((doc) =>
        JSON.stringify({
          text: doc.text,
          custom_id: doc.custom_id,
        }),
      );

      const response = await this.cohere.rerank({
        model: "rerank-v3.5",
        query: query,
        documents: jsonDocs,
        topN: topN,
        rankFields: ["text"],
        returnDocuments: true,
      });

      log.info("Ranked documents:");
      log.info(response.results);
      return response.results;
    } catch (error) {
      log.error("Error during reranking:", error);
      return [];
    }
  }

  protected extractCustomId(doc: RerankResponseResultsItem): string {
    try {
      const parsedText = JSON.parse(
        doc.document?.text || "",
      ) as SimplifiedResult;
      if (!parsedText || typeof parsedText !== "object") {
        throw new Error("Parsed text is not an object");
      }

      if (!parsedText.custom_id || typeof parsedText.custom_id !== "string") {
        throw new Error("custom_id is not a string");
      }

      return parsedText.custom_id;
    } catch (error) {
      log.error("Error in extractCustomId:", error);
      throw new Error("Failed to extract custom_id");
    }
  }

  protected async rerankAndExtractCustomIds(
    hits: SearchHit<CustomSource>[],
    query: string,
  ): Promise<string[]> {
    const simplifiedResults = this.transformHits(hits);
    const rerankedResults = await this.rerankDocuments(
      query,
      simplifiedResults,
    );
    return rerankedResults.map(this.extractCustomId);
  }

  protected async retrieveAndProcessQuestions(
    customIds: string[],
  ): Promise<QuizQuestionWithRawJson[]> {
    const quizQuestions = await this.questionArrayFromCustomIds(customIds);
    return quizQuestions;
  }
}
