import { Client } from "@elastic/elasticsearch";
import type { SearchResponseBody } from "@elastic/elasticsearch/lib/api/types";
// TODO: GCLOMAX This is a bodge. Fix as soon as possible due to the new prisma client set up.
import { prisma } from "@oakai/db";
import { CohereClient } from "cohere-ai";
// TODO: double check the prisma import
import type { RerankResponseResultsItem } from "cohere-ai/api/types";
import { z } from "zod";

import {
  JsonPatchDocumentSchema,
  PatchQuiz,
} from "../../../protocol/jsonPatchProtocol";
import type { JsonPatchDocument } from "../../../protocol/jsonPatchProtocol";
import type {
  QuizOperationType,
  Quiz,
  AilaRagRelevantLesson,
} from "../../../protocol/schema";
import { QuizQuestionSchema } from "../../../protocol/schema";
import type {
  LooseLessonPlan,
  QuizQuestion,
  QuizPath,
} from "../../../protocol/schema";
import type { AilaQuizGeneratorService } from "../../AilaServices";
import type { SimplifiedResult } from "../AilaQuiz";
import type { CustomHit } from "../interfaces";
import { CohereReranker } from "../rerankers";
import { lessonSlugQuizMap } from "./lessonSlugLookup";

// Base abstract class
export abstract class BaseQuizGenerator implements AilaQuizGeneratorService {
  protected client: Client;
  protected cohere: CohereClient;
  protected rerankService: CohereReranker;

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

    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY as string,
    });

    // This should be changed to use our hosted models - use this for dev simplicity.
    this.rerankService = new CohereReranker();
  }

  // The below is overly bloated and a midstep in refactoring.
  abstract generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<Quiz[]>;
  abstract generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<Quiz[]>;

  // ... other implementations
  public async generateMathsQuizFromRagPlanId(
    planIds: string,
  ): Promise<JsonPatchDocument> {
    const lessonSlugs = await this.getLessonSlugFromPlanId(planIds);
    // TODO: add error throwing here if lessonSlugs is null
    const lessonSlugList = lessonSlugs ? [lessonSlugs] : [];
    const customIds = await this.lessonSlugToQuestionIdSearch(lessonSlugList);
    const patch = await this.patchFromCustomIDs(customIds);
    return patch;
  }

  public async getLessonSlugFromPlanId(planId: string): Promise<string | null> {
    try {
      const result = await prisma.lessonPlan.findUnique({
        where: { id: planId },
        select: {
          lesson: true,
        },
      });

      return result?.lesson.slug || null;
    } catch (error) {
      console.error("Error fetching lesson slug:", error);
      return null;
    }
  }

  public async lessonSlugToQuestionIdSearch(
    lessonSlugs: string[],
  ): Promise<string[]> {
    // Converts a lesson slug to a question ID via searching in index
    // TODO: reconfigure database to make this more efficient

    const response = await this.client.search({
      index: "oak-vector",
      body: {
        query: {
          bool: {
            must: [
              { exists: { field: "metadata.lessonSlug" } },
              { exists: { field: "metadata.questionUid" } },
              {
                terms: {
                  "metadata.lessonSlug.keyword": lessonSlugs,
                },
              },
            ],
          },
        },
      },
    });
    // TODO type this.
    // hit is unknown
    const questionIds: string[] = response.hits.hits.map(
      (hit: any) => hit._source.metadata.questionUid,
    );
    return questionIds;
  }

  public lessonSlugToQuestionIdsLookupTable(
    lessonSlug: string,
    quizType: QuizPath,
  ): string[] {
    if (quizType === "/starterQuiz") {
      return (
        lessonSlugQuizMap?.[lessonSlug]?.starterQuiz ?? ["QUES-HDSJ2-34404"]
      );
    } else if (quizType === "/exitQuiz") {
      return lessonSlugQuizMap?.[lessonSlug]?.exitQuiz ?? ["QUES-HDSJ2-34404"];
    }
    throw new Error("Invalid quiz type");
  }

  public async patchFromCustomIDs(
    customIds: string[],
    quizType: QuizPath = "/starterQuiz",
  ): Promise<JsonPatchDocument> {
    // Get the questions by searching for the questions with the custom IDs
    const quizQuestions: Quiz =
      await this.questionArrayFromCustomIds(customIds);
    const patch = this.quizToJsonPatch(quizQuestions, quizType);
    return patch;
  }
  public async questionArrayFromCustomIds(
    customIds: string[],
  ): Promise<QuizQuestion[]> {
    // TODO: GCLOMAX - dependancy injection of index here.

    const formattedQuestionSearchResponse = await this.searchQuestions(
      this.client,
      "quiz-questions-text-only",
      customIds,
    );
    const processsedQuestionsAndIds = this.processResponse(
      formattedQuestionSearchResponse,
    );
    const quizQuestions = this.extractQuizQuestions(processsedQuestionsAndIds);
    return quizQuestions;
  }

  public async questionArrayFromPlanIdLookUpTable(
    planId: string,
    quizType: QuizPath,
  ): Promise<QuizQuestion[]> {
    const lessonSlug = await this.getLessonSlugFromPlanId(planId);
    if (!lessonSlug) {
      throw new Error("Lesson slug not found for planId: " + planId);
    }
    const questionIds = this.lessonSlugToQuestionIdsLookupTable(
      lessonSlug,
      quizType,
    );

    const quizQuestions = await this.questionArrayFromCustomIds(questionIds);
    return quizQuestions;
  }

  public async questionArrayFromPlanId(
    planId: string,
    quizType: QuizPath = "/starterQuiz",
  ): Promise<QuizQuestion[]> {
    // const lessonSlug = await this.getLessonSlugFromPlanId(planId);
    // const lessonSlugList = lessonSlug ? [lessonSlug] : [];
    // const customIds = await this.lessonSlugToQuestionIdSearch(lessonSlugList);
    // const quizQuestions = await this.questionArrayFromCustomIds(customIds);
    // return quizQuestions;
    return await this.questionArrayFromPlanIdLookUpTable(planId, quizType);
  }

  public async searchQuestions(
    client: Client,
    index: string,
    questionUids: string[],
  ): Promise<SearchResponseBody> {
    // Retrieves questions by questionUids
    const response = await client.search({
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
  protected unpackLessonPlanForRecommender(
    lessonPlan: LooseLessonPlan,
    lessonPlanRerankerFields: string[] = [
      "title",
      "topic",
      "learningOutcome",
      "keyLearningPoints",
    ],
  ): string {
    const unpackedList: string[] = [];

    for (const field of lessonPlanRerankerFields) {
      const content = lessonPlan[field as keyof LooseLessonPlan];

      if (Array.isArray(content)) {
        // TODO Review this
        unpackedList.push(
          ...content.filter((item): item is string => typeof item === "string"),
        );
      } else if (typeof content === "string") {
        unpackedList.push(content);
      }
    }
    return unpackedList.join("");
  }
  protected transformHits(hits: CustomHit[]): SimplifiedResult[] {
    return hits
      .map((hit) => {
        const source = hit._source;

        // Check if the required fields exist
        if (
          typeof source.text !== "string" ||
          typeof source.metadata?.custom_id !== "string"
        ) {
          console.warn("Hit is missing required fields:", hit);
          return null;
        }

        return {
          text: source.text,
          custom_id: source.metadata.custom_id,
        };
      })
      .filter((item): item is SimplifiedResult => item !== null);
  }
  private extractQuizQuestions(
    processedResponse: ReturnType<typeof this.processResponse>,
  ): QuizQuestion[] {
    //TODO: test that this is working properly - also typing as any is bad.
    return processedResponse
      .filter(
        (
          item: any,
        ): item is { questionUid: string; quizQuestion: QuizQuestion } =>
          "quizQuestion" in item,
      )
      .map(
        (item: { questionUid: string; quizQuestion: QuizQuestion }) =>
          item.quizQuestion,
      );
  }
  private processResponse(response: SearchResponseBody) {
    return response.hits.hits.map((hit: any) => {
      const parsedQuestion = this.parseQuizQuestion(hit._source.text);

      return {
        questionUid: hit._source.metadata.questionUid,
        ...(parsedQuestion
          ? { quizQuestion: parsedQuestion }
          : { text: hit._source.text }),
      };
    });
  }
  // TODO: GCLOMAX abstract this into a search service / class so can easily swap out for hybrid once re-ingested.
  protected async searchWithBM25(
    // client: Client,
    index: string,
    field: string,
    query: string,
    size: number = 10,
  ): Promise<any> {
    // const client = new Client({ node: "http://localhost:9200" });
    try {
      console.log(
        `Searching index: ${index}, field: ${field}, query: ${query}`,
      );
      // const response = await client.search({
      //   index: index,
      //   body: {
      //     size: size,
      //     query: {
      //       match: {
      //         [field]: {
      //           query: query,
      //           operator: 'and',
      //           fuzziness: 'AUTO'
      //         }
      //       }
      //     },
      //     highlight: {
      //       fields: {
      //         [field]: {}
      //       }
      //     }
      //   }
      // })
      //  Simple dummy search as placeholder.
      // Searches over question descriptions
      const response = await this.client.search<CustomHit>({
        index: "oak-vector",
        query: {
          bool: {
            must: [{ match: { text: query } }],
            filter: [{ exists: { field: "metadata.is_question_description" } }],
          },
        },
      });
      // TODO: check if this is the correct type.
      // TODO: Fix this retriever here.
      // response.hits.hits.forEach((hit: SearchHit<CustomHit>) => {
      //   const source: CustomHit | undefined = hit._source;

      //   if (source) {
      //     // Accessing known fields
      //     console.log(`Text: ${source.text}`);
      //     console.log(`Custom ID: ${source.metadata.custom_id}`);
      //   }
      // });

      // console.log("Search response:", JSON.stringify(response, null, 2));

      if (!response.hits) {
        throw new Error("No hits property in the search response");
      }

      return response.hits;
    } catch (error) {
      console.error("Error searching Elasticsearch:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  }
  // TODO: GCLOMAX abstract this into the reranker service / class so can easily swap out for hybrid once re-ingested.
  protected async rerankDocuments(
    query: string,
    docs: SimplifiedResult[],
    topN: number = 10,
  ) {
    // TODO: add in other reranking methods here.
    // conforming to https://github.com/cohere-ai/cohere-typescript/blob/2e1c087ed0ec7eacd39ad062f7293fb15e453f33/src/api/client/requests/RerankRequest.ts#L15
    try {
      const jsonDocs = docs.map((doc) =>
        JSON.stringify({
          text: doc.text,
          custom_id: doc.custom_id,
        }),
      );
      // this should have na error below - https://github.com/cohere-ai/cohere-typescript/blob/499bde51cee5d1f2ea2068580f938123297515f9/src/api/client/requests/RerankRequest.ts#L31
      const response = await this.cohere.rerank({
        model: "rerank-english-v2.0",
        query: query,
        // documents: JSON.stringify(docs),
        documents: jsonDocs,
        // documents: docs,
        topN: topN,
        //@ts-ignore WARNING THIS IS INSECURE - WE WILL UPDATE COHERE TO FIX THIS.
        rankFields: ["text"],
        returnDocuments: true,
      });
      // console.log("Full response:", JSON.stringify(response, null, 2));

      // const rankedDocs = response.body.results.map((result) => ({
      //   ...docs[result.index],
      //   relevanceScore: result.relevance_score,
      // }));
      console.log("Ranked documents:");
      console.log(response.results);
      return response.results;
    } catch (error) {
      console.error("Error during reranking:", error);
      return [];
    }
  }
  protected extractCustomId(doc: RerankResponseResultsItem): string {
    try {
      // TODO quick fix to get around that doc.document may be unknown
      const parsedText = JSON.parse(doc.document?.text || "");
      if (parsedText.custom_id) {
        return parsedText.custom_id;
      } else {
        throw new Error("custom_id not found in parsed JSON");
      }
    } catch (error) {
      console.error("Error in extractCustomId:", error);
      throw new Error("Failed to extract custom_id");
    }
  }
  protected async rerankAndExtractCustomIds(
    hits: CustomHit[],
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
  ): Promise<QuizQuestion[]> {
    const formattedQuestionSearchResponse = await this.searchQuestions(
      this.client,
      // "oak-vector",
      "quiz-questions-text-only",
      customIds,
    );
    const processedQuestionsAndIds = this.processResponse(
      formattedQuestionSearchResponse,
    );
    return this.extractQuizQuestions(processedQuestionsAndIds);
  }

  protected quizToJsonPatch(
    quizQuestions: QuizQuestion[],
    quizType: QuizPath = "/starterQuiz",
    quizOperationType: QuizOperationType = "add",
  ): JsonPatchDocument {
    const quizPatchObject: z.infer<typeof PatchQuiz> = {
      op: quizOperationType,
      path: quizType,
      value: quizQuestions,
    };

    const result = PatchQuiz.safeParse(quizPatchObject);
    if (!result.success) {
      console.error("Failed to validate patch object");
      console.error(
        "Failed Object: ",
        JSON.stringify(quizPatchObject, null, 2),
      );
      console.error("Validation errors:", result.error);
      throw new Error("Failed to validate patch object");
    }
    const patch: JsonPatchDocument = {
      type: "patch",
      reasoning:
        "adding maths quiz because i need to teach the kids about this",
      value: quizPatchObject,
    };

    const jsonPatchParseResult = JsonPatchDocumentSchema.safeParse(patch);
    if (!jsonPatchParseResult.success) {
      console.error("Failed to validate json patch object");
      console.error("Validation errors:", jsonPatchParseResult.error);
      console.error("Failed Object: ", JSON.stringify(patch, null, 2));
      throw new Error("Failed to validate json patch object");
    }
    console.log("MATHS_EXIT_QUIZ_FOLLOWING");
    console.log("FULL_QUIZ_PATCH: ", patch);
    return patch;
  }
  private parseQuizQuestion(jsonString: string): QuizQuestion | null {
    try {
      // Parse JSON string into an object
      const data = JSON.parse(jsonString);

      // Validate and parse the data against the schema
      return QuizQuestionSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
      } else if (error instanceof SyntaxError) {
        console.error(
          "OFFENDING JSON STRING: ",
          JSON.stringify(jsonString, null, 2),
        );
        console.error("JSON parsing error:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
      return null;
    }
  }
}

// // Combined Approach Quiz Generator
// export class CombinedQuizGenerator extends BaseQuizGenerator {
//   async combinedRerankingOpenAIMLQuizGeneration<T extends z.ZodType>(
//     lessonPlan: LooseLessonPlan,
//     ratingSchema: T,
//     quizType: QuizPath,
//   ): Promise<QuizQuestion[]> {
//     // Implementation for combined approach
//   }
//   // ... other implementations
// }
