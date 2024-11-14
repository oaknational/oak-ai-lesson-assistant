import { Client } from "@elastic/elasticsearch";
import type { SearchResponseBody } from "@elastic/elasticsearch/lib/api/types";
import { SearchHit } from "@elastic/elasticsearch/lib/api/types";
import { Json } from "@oakai/core/src/models/prompts";
import { moderationResultSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import {
  embedTextLarge,
  embedWithCacheTextLarge,
} from "@oakai/core/src/utils/embeddings";
// TODO: GCLOMAX This is a bodge. Fix as soon as possible due to the new prisma client set up.
import { prisma } from "@oakai/db";
// TODO: double check the prisma import
import { CohereClient } from "cohere-ai";
import type { RerankResponseResultsItem } from "cohere-ai/api/types";
import { z } from "zod";

import type { AilaQuizService } from "..";
import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import {
  JsonPatchAddSchema,
  JsonPatchDocumentOptional,
  JsonPatchDocumentSchema,
  PatchQuiz,
} from "../../protocol/jsonPatchProtocol";
import type {
  LooseLessonPlan,
  QuizQuestion,
  QuizPath,
  QuizOperationType,
  Quiz,
} from "../../protocol/schema";
import { QuizQuestionSchema, QuizSchema } from "../../protocol/schema";
import { selectHighestRated } from "./ChoiceModels";
import {
  evaluateQuiz,
  evaluateStarterQuiz,
  parsedResponse,
} from "./OpenAIRanker";
import type { QuizzesForConsideration } from "./RerankerStructuedOutputsSchema";
import { starterQuizQuestionSuitabilityDescriptionSchema } from "./RerankerStructuedOutputsSchema";
import { processArray, withRandomDelay } from "./apiCallingUtils";
import { testInput } from "./cachedQuizOutput";

interface CustomMetadata {
  custom_id: string;
  [key: string]: unknown; // Allow for other unknown metadata fields
}

interface CustomSource {
  text: string;
  metadata: CustomMetadata;
  [key: string]: unknown; // Allow for other unknown fields at the top level
}

interface CustomHit {
  _source: CustomSource;
}

interface SimplifiedResult {
  text: string;
  custom_id: string;
}

interface Document {
  document: {
    text: string;
  };
  index: number;
  relevanceScore: number;
}

interface SimplifiedResultQuestion {
  text: string;
  questionUid: string;
}

interface Document {
  text: string;
}

interface DocumentWrapper {
  document: Document;
  index: number;
  relevanceScore: number;
}

type quizPatchType = "/starterQuiz" | "/exitQuiz";

// function extractCustomId(doc: DocumentWrapper): string | null {
// try {
//     const parsedText = JSON.parse(doc.document.text);
//     return parsedText.custom_id || null;
// } catch (error) {
//     console.error("Error parsing JSON:", error);
//     return null;
// }
// }

// Example prior knowledge "priorKnowledge":["Basic understanding of geometric shapes.","Knowledge of angles and how to measure them.","Understanding of the properties of circles, including radius, diameter, and circumference.","Familiarity with basic algebraic manipulation.","Ability to interpret and draw geometric diagrams."]

export class AilaQuiz implements AilaQuizService {
  // TODO: put this in doppler.
  //   API Keys Here INSECURE.

  private client: Client = new Client({
    cloud: {
      id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID as string,
    },

    auth: {
      apiKey: process.env.I_DOT_AI_ELASTIC_KEY as string,
    },
  });

  private cohere = new CohereClient({
    token: process.env.COHERE_API_KEY as string,
  });

  public containsMath(subject: string | undefined | null): boolean {
    return subject?.toLowerCase().includes("math") ?? false;
  }

  private extractCustomId(doc: RerankResponseResultsItem): string {
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

  private unpackLessonPlanForRecommender(
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

  private async searchWithBM25(
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

  public async getLessonIdFromPlanId(planId: string): Promise<string | null> {
    try {
      const lessonPlan = await prisma.lessonPlan.findUnique({
        where: { id: planId },
        select: { lessonId: true },
      });

      return lessonPlan?.lessonId || null;
    } catch (error) {
      console.error("Error fetching lessonId:", error);
      return null;
    }
  }

  public async getLessonSlugFromPlanId(planId: string): Promise<string | null> {
    try {
      const result = await prisma.lessonPlan.findUnique({
        where: { id: planId },
        select: {
          lesson: {
            select: {
              slug: true,
            },
          },
        },
      });

      return result?.lesson?.slug || null;
    } catch (error) {
      console.error("Error fetching lesson slug:", error);
      return null;
    }
  }

  private async searchQuestions(
    client: Client,
    index: string,
    questionUids: string[],
  ): Promise<SearchResponseBody> {
    // currently metadata.is_quiz_question_schema is th flag we use for
    // Retrieves questions by questionUids
    const response = await client.search({
      index: index,
      body: {
        query: {
          bool: {
            must: [
              { exists: { field: "metadata.is_quiz_question_schema" } },
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

  private transformHits(hits: CustomHit[]): SimplifiedResult[] {
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

  // The schema throws an error due to strange bug with union of types
  // We instead return the type from a func instead to abstract the logic
  // And also remove the compiler error for testing
  //  TODO: Fix this.
  /**
   * @param starterPatchObject
   * @returns JsonPatchDocument
   * @description This function takes a PatchQuiz object and converts it to a JsonPatchDocument object.
   * It also validates the PatchQuiz object against the schema.
   * If the validation fails, it will return a default JsonPatchDocument object with a single question.
   */
  private quizToJsonPatch(
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

    // let patch: JsonPatchDocument = {
    //   type: "patch",
    //   reasoning:
    //     "adding maths quiz because i need to teach the kids about this",
    //   value: {
    //     op: "add", // or "replace"
    //     path: "/exitQuiz", // or "/starterQuiz"
    //     value: [
    //       {
    //         question: "QUESTION INCORRECTLY PARSED",
    //         answers: ["Answer 1"],
    //         distractors: ["Distractor 1", "Distractor 2"],
    //       },
    //     ],
    //   },
    // };
    // if (result.success) {
    //   patch.value = result.data;
    // }
    console.log("MATHS_EXIT_QUIZ_FOLLOWING");
    console.log("FULL_QUIZ_PATCH: ", patch);
    return patch;
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
        console.error("JSON parsing error:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
      return null;
    }
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

  private async rerankDocuments(
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
  // TODO: Rename this.
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

  // private async planIdsToLessonSlugs(planIds: string[]): Promise<string[]> {
  //   // Converts a plan ID to a lesson slug via searching in index
  //   return planIds;
  // }

  // // TODO This is currently commented out - this is because it relies on tech preview from elasticsearch 8.15, which we are not using
  // // Due to dependancy issues with the current version.
  // private async blendedVectorSearch(query: string, size: number = 10) {
  //   try {
  //     console.log(`Searching with query: ${query}`);
  //     // const queryVector = await embedWithCacheTextLarge(query);
  //     const queryVector = await embedTextLarge(query);
  //     // // Generate embedding for the query
  //     // const embeddingResponse = await openai.createEmbedding({
  //     //   model: "text-embedding-3-large",
  //     //   input: query,
  //     // });
  //     // const queryVector = embeddingResponse.data.data[0].embedding;
  //     // console.log("RECIEVED QUERY VECTOR:", queryVector);
  //     // this._aila._openAIClient.createEmbedding
  //     // this._openAIClient.createEmbedding

  //     const response = await this.client.search<CustomHit>({
  //       index: "oak-vector",
  //       retriever: {
  //         rrf: {
  //           retrievers: [
  //             {
  //               standard: {
  //                 query: {
  //                   term: {
  //                     text: query,
  //                   },
  //                 },
  //               },
  //             },
  //             {
  //               knn: {
  //                 field: "vector",
  //                 query_vector: queryVector,
  //                 k: 50,
  //                 num_candidates: 100,
  //               },
  //             },
  //           ],
  //           rank_window_size: 50,
  //           rank_constant: 20,
  //         },
  //       },
  //     });
  //     //   body: {
  //     //     size: size,
  //     //     query: {
  //     //       bool: {
  //     //         should: [
  //     //           {
  //     //             match: {
  //     //               text: {
  //     //                 query: query,
  //     //                 boost: 0.5, // Adjust this value to change the importance of text matching
  //     //               },
  //     //             },
  //     //           },
  //     //           {
  //     //             script_score: {
  //     //               query: { match_all: {} },
  //     //               script: {
  //     //                 source:
  //     //                   "cosineSimilarity(params.query_vector, 'vector') + 1.0",
  //     //                 params: { query_vector: queryVector },
  //     //               },
  //     //               boost: 0.5, // Adjust this value to change the importance of vector similarity
  //     //             },
  //     //           },
  //     //         ],
  //     //         filter: [
  //     //           { exists: { field: "metadata.is_question_description" } },
  //     //         ],
  //     //       },
  //     //     },
  //     //     highlight: {
  //     //       fields: {
  //     //         text: {},
  //     //       },
  //     //     },
  //     //   },
  //     // });

  //     return response.hits;
  //   } catch (error) {
  //     console.error("Error during search:", error);
  //     throw error;
  //   }
  // }

  private async searchRerank(
    query: string,
    size: number = 10,
    topN: number = 1,
  ): Promise<string[]> {
    // Searches for most relevant documents for each entry in a list of strings. Reranks the documents based on the query.
    // Takes the top k documents for each query and reranks them based on the query.
    const results = await this.searchWithBM25(
      // this.client,
      "oak-vector",
      "text",
      query,
      100,
    );
    // const results = await this.blendedVectorSearch(qq, 100);
    const simplifiedResults = this.transformHits(results.hits);
    // console.log("SIMPLIFIED RESULTS: ", simplifiedResults);
    const rerankedResults = await this.rerankDocuments(
      query,
      simplifiedResults,
      topN,
    );
    // console.log("RERANKED RESULTS: ", rerankedResults);
    console.log("FIRST");
    const customIds = rerankedResults
      .map(this.extractCustomId)
      .filter((id) => id !== null);
    console.log("FOR QUERY:", query);
    console.log("CUSTOM ID EXTRACTED FROM RERANKED RESULTS:", customIds);
    // TODO: change the return of customIDs to be this or empty string not null.
    return customIds;
  }

  public async questionArrayFromCustomIds(
    customIds: string[],
  ): Promise<QuizQuestion[]> {
    const formattedQuestionSearchResponse = await this.searchQuestions(
      this.client,
      "oak-vector",
      customIds,
    );
    const processsedQuestionsAndIds = this.processResponse(
      formattedQuestionSearchResponse,
    );
    const quizQuestions = this.extractQuizQuestions(processsedQuestionsAndIds);
    return quizQuestions;
  }

  /**
   * Retrieves an array of quiz questions based on the provided lesson plan ID. These quiz questions
   * correspond to all questions related to the lesson plan. They can then be used to judge suitability
   * for a given lesson plan.
   *
   * @param {string} planId - The ID of the lesson plan from which to retrieve quiz questions.
   * @returns {Promise<QuizQuestion[]>} A promise that resolves to an array of QuizQuestion objects.
   */
  public async questionArrayFromPlanId(
    planId: string,
  ): Promise<QuizQuestion[]> {
    const lessonSlug = await this.getLessonSlugFromPlanId(planId);
    const lessonSlugList = lessonSlug ? [lessonSlug] : [];
    const customIds = await this.lessonSlugToQuestionIdSearch(lessonSlugList);
    const quizQuestions = await this.questionArrayFromCustomIds(customIds);
    return quizQuestions;
  }

  public async patchFromCustomIDs(
    customIds: string[],
    quizType: QuizPath = "/starterQuiz",
  ): Promise<JsonPatchDocument> {
    // Get the questions by searching for the questions with the custom IDs
    // const formattedQuestionSearchResponse = await this.searchQuestions(
    //   this.client,
    //   "oak-vector",
    //   customIds,
    // );
    // console.log("THIRD");
    // console.log(
    //   "FORMATTED QUESTION SEARCH RESPONSE: ",
    //   formattedQuestionSearchResponse,
    // );
    // // console.log(
    // //   "FORMATTED QUESTION SEARCH RESPONSE: ",
    // //   formattedQuestionSearchResponse.hits.hits,
    // // );
    // // converts response to QuizSchema array
    // const processsedQuestionsAndIds = this.processResponse(
    //   formattedQuestionSearchResponse,
    // );

    // console.log("FOURTH");
    // // console.log("PROCESSED QUESTIONS AND IDS: ", processsedQuestionsAndIds);

    // const quizQuestions = this.extractQuizQuestions(processsedQuestionsAndIds);
    // console.log("FIFTH");
    // console.log("QUIZ QUESTIONS INSIDE: ", quizQuestions);

    // // const starterPatchObject: z.infer<typeof PatchQuiz> = {
    // //   op: literalObject,
    // //   path: quizType,
    // //   value: quizQuestions,
    // // };

    // // // const obj: {
    // // //   op: "add" | "replace";
    // // //   path: "/starterQuiz" | "/exitQuiz";
    // // //   value: { question: string; answers: string[]; distractors: string[]; }[];
    // // // } = {
    // // //   op: "add",
    // // //   path: "/starterQuiz",
    // // //   value: quizQuestions,
    // // // };
    // // console.log("SIXTH");
    // // //     // Validate against the schema
    // // // starterPatchObject as typeof PatchQuiz;

    // // const patch = this.patchQuizToJsonPatch(obj);
    // // // const result = PatchQuiz.safeParse(starterPatchObject);
    // // // const patch: JsonPatchDocument = {
    // // //   type: "patch",
    // // //   reasoning:
    // // //     "adding maths quiz because i need to teach the kids about this",
    // // //   value: result.data,
    // // // };
    // // // console.log("MATHS_EXIT_QUIZ_FOLLOWING");
    // // // console.log("FULL_QUIZ_PATCH: ", patch);
    const quizQuestions: Quiz =
      await this.questionArrayFromCustomIds(customIds);
    const patch = this.quizToJsonPatch(quizQuestions, quizType);
    return patch;
  }

  private async rerankGatherCustomIds(
    query_list: string[],
    topN_gather: number,
  ): Promise<string[]> {
    // Takes a list of queries and retrieves and reranks against each individual query in turn
    // Returns a JsonPatchDocument with the custom_ids of the topN_gather documents for each query
    // This is useful for gathering a large number of documents for a single query where we have individual entries for a field in the lesson plan that may be disperate across multiple documents, such as prior knowledge.

    // TODO: abstract this and the above function into a

    const customIds = await Promise.all(
      query_list.map(
        async (query) => await this.searchRerank(query, 100, topN_gather),
      ),
    ).then((results) => results.flat());

    console.log("CUSTOM IDS GATHERED: ", customIds);
    return customIds;
  }

  public async generateGatherMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument> {
    // Takes a lesson plan and extracts the prior knowledge field, then gathers and reranks the topN_gather documents for each entry in the prior knowledge field.
    // Returns a JsonPatchDocument with the custom_ids of the topN_gather documents for each entry in the prior knowledge field.

    // TODO: Sort out the typing her.
    console.log("AAA1");
    const priorKnowledge = lessonPlan.priorKnowledge ?? [];
    console.log("AAA2");
    const customIds = await this.rerankGatherCustomIds(priorKnowledge, 1);
    console.log("AAA3");
    const patch = await this.patchFromCustomIDs(customIds);
    console.log("AAA4");
    return patch;
  }

  // public async cachedQuiz(lessonPlan)

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

  private async unpackAndSearch(
    lessonPlan: LooseLessonPlan,
  ): Promise<CustomHit[]> {
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    const results = await this.searchWithBM25("oak-vector", "text", qq, 100);
    return results.hits;
  }

  private async rerankAndExtractCustomIds(
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

  private async retrieveAndProcessQuestions(
    customIds: string[],
  ): Promise<QuizQuestion[]> {
    const formattedQuestionSearchResponse = await this.searchQuestions(
      this.client,
      "oak-vector",
      customIds,
    );
    const processedQuestionsAndIds = this.processResponse(
      formattedQuestionSearchResponse,
    );
    return this.extractQuizQuestions(processedQuestionsAndIds);
  }

  public async generateMathsQuizML(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    const hits = await this.unpackAndSearch(lessonPlan);
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    const customIds = await this.rerankAndExtractCustomIds(hits, qq);
    const quizQuestions = await this.retrieveAndProcessQuestions(customIds);
    return quizQuestions;
  }

  public async generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument> {
    console.log("MATHS LESSON");
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    const results = await this.searchWithBM25(
      // this.client,
      "oak-vector",
      "text",
      qq,
      100,
    );
    // const results = await this.blendedVectorSearch(qq, 100);

    const simplifiedResults = this.transformHits(results.hits);
    // console.log("SIMPLIFIED RESULTS: ", simplifiedResults);
    const rerankedResults = await this.rerankDocuments(qq, simplifiedResults);
    // console.log("RERANKED RESULTS: ", rerankedResults);
    console.log("FIRST");
    const customIds = rerankedResults.map(this.extractCustomId);
    // console.log("CUSTOM IDS EXTRACTED: ", customIds);
    console.log("SECOND");
    // TODO: Add the cloud and auth to the secrets in doppler
    // TODO: abstract client to the class.

    // Get the questions by searching for the questions with the custom IDs
    const formattedQuestionSearchResponse = await this.searchQuestions(
      this.client,
      "oak-vector",
      customIds,
    );
    console.log("THIRD");
    console.log(
      "FORMATTED QUESTION SEARCH RESPONSE: ",
      formattedQuestionSearchResponse,
    );
    // console.log(
    //   "FORMATTED QUESTION SEARCH RESPONSE: ",
    //   formattedQuestionSearchResponse.hits.hits,
    // );
    // converts response to QuizSchema array
    const processsedQuestionsAndIds = this.processResponse(
      formattedQuestionSearchResponse,
    );

    console.log("FOURTH");
    // console.log("PROCESSED QUESTIONS AND IDS: ", processsedQuestionsAndIds);

    const quizQuestions = this.extractQuizQuestions(processsedQuestionsAndIds);
    console.log("FIFTH");
    console.log("QUIZ QUESTIONS INSIDE: ", quizQuestions);

    // const starterPatchObject = {
    //   op: "add",
    //   path: "/exitQuiz",
    //   value: quizQuestions,
    // };

    // const quizOperation: QuizOperationType = "add";
    // const quizPath: QuizPath = "/exitQuiz";

    // const starterPatchObject: z.infer<typeof PatchQuiz> = {
    //   op: quizOperation,
    //   path: quizPath,
    //   value: quizQuestions,
    // };

    // console.log("SIXTH");
    // //     // Validate against the schema
    // const result = PatchQuiz.safeParse(starterPatchObject);
    // if (!result.success) {
    //   throw new Error("Failed to validate patch object");
    // }

    // const patch: JsonPatchDocument = {
    //   type: "patch",
    //   reasoning:
    //     "adding maths quiz because i need to teach the kids about this",
    //   value: starterPatchObject,
    // };
    // console.log("MATHS_EXIT_QUIZ_FOLLOWING");
    // console.log("FULL_QUIZ_PATCH: ", patch);
    const patch = this.quizToJsonPatch(quizQuestions, "/exitQuiz");
    return patch;
  }
  // TODO: Abstract this away.
  public async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument> {
    console.log("MATHS LESSON");
    const qq = this.unpackLessonPlanForRecommender(lessonPlan, [
      "priorKnowledge",
    ]);
    const results = await this.searchWithBM25(
      // this.client,
      "oak-vector",
      "text",
      qq,
      100,
    );
    // const results = await this.blendedVectorSearch(qq, 100);

    const simplifiedResults = this.transformHits(results.hits);
    // console.log("SIMPLIFIED RESULTS: ", simplifiedResults);
    const rerankedResults = await this.rerankDocuments(qq, simplifiedResults);
    // console.log("RERANKED RESULTS: ", rerankedResults);
    console.log("FIRST");
    const customIds = rerankedResults.map(this.extractCustomId);
    // console.log("CUSTOM IDS EXTRACTED: ", customIds);
    console.log("SECOND");
    // TODO: Add the cloud and auth to the secrets in doppler
    // TODO: abstract client to the class.

    // Get the questions by searching for the questions with the custom IDs
    const formattedQuestionSearchResponse = await this.searchQuestions(
      this.client,
      "oak-vector",
      customIds,
    );
    console.log("THIRD");
    console.log(
      "FORMATTED QUESTION SEARCH RESPONSE: ",
      formattedQuestionSearchResponse,
    );
    // console.log(
    //   "FORMATTED QUESTION SEARCH RESPONSE: ",
    //   formattedQuestionSearchResponse.hits.hits,
    // );
    // converts response to QuizSchema array
    const processsedQuestionsAndIds = this.processResponse(
      formattedQuestionSearchResponse,
    );

    console.log("FOURTH");
    // console.log("PROCESSED QUESTIONS AND IDS: ", processsedQuestionsAndIds);

    const quizQuestions = this.extractQuizQuestions(processsedQuestionsAndIds);
    console.log("FIFTH");
    console.log("QUIZ QUESTIONS INSIDE: ", quizQuestions);

    // const starterPatchObject = {
    //   op: "add",
    //   path: "/starterQuiz",
    //   value: quizQuestions,
    // };
    // console.log("SIXTH");
    // //     // Validate against the schema
    // // const result2 = starterPatchObject as typeof PatchQuiz;
    // const result = PatchQuiz.safeParse(starterPatchObject);
    // let patch: JsonPatchDocument = {
    //   type: "patch",
    //   reasoning:
    //     "adding maths quiz because i need to teach the kids about this",
    //   value: {
    //     op: "add", // or "replace"
    //     path: "/exitQuiz", // or "/starterQuiz"
    //     value: [
    //       {
    //         question: "QUESTION INCORRECTLY PARSED",
    //         answers: ["Answer 1"],
    //         distractors: ["Distractor 1", "Distractor 2"],
    //       },
    //     ],
    //   },
    // };
    // if (result.success) {
    //   patch.value = result.data;
    // }
    // console.log("MATHS_EXIT_QUIZ_FOLLOWING");
    // console.log("FULL_QUIZ_PATCH: ", patch);
    const patch = this.quizToJsonPatch(quizQuestions, "/starterQuiz");

    return patch;
  }

  // public async generateQuizPatchBasedOnMethod(basedOn: string, quizType: quizPatchType): Promise<JsonPatchDocument> {
  //   // Generates a quiz patch based on the method specified using the origional teacher made quiz content.
  //   // The quizType specifies whether the patch is for the starter or exit quiz.
  //   const lessonSlug = await this.getLessonSlugFromPlanId(basedOn);
  //   if (!lessonSlug) {
  //     throw new Error("Lesson slug not found");
  //   }

  //   const lessonSlugs = await

  //   private adjudicateStarterExitQuizPatch(
  //     starterQuestions: QuizQuestion[],
  //     exitQuestions: QuizQuestion[],
  //   ): JsonPatchDocumentOptional {
  //     // Check if there are overlapping questions between the starter and exit quizzes

  //     const overlappingQuestions = starterQuestions.filter((starterQuestion) =>
  //       exitQuestions.some(
  //         (exitQuestion) =>
  //           exitQuestion.questionUid === starterQuestion.questionUid,
  //       ),
  //     );
  //   }

  // TODO: Modify to include generic rating.
  // The T means that we can include any type of rating schema from zod.
  public async retrieveQuizFromPlanIdAndRateStarterQuiz<T extends z.ZodType>(
    planId: string,
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
  ): Promise<z.infer<T>> {
    const questionArray = await this.questionArrayFromPlanId(planId);
    const response = await evaluateStarterQuiz(
      lessonPlan,
      questionArray,
      1500,
      ratingSchema,
    );
    const rating = parsedResponse(ratingSchema, response);
    return rating;
  }

  public async retrieveQuizFromPlanIdAndRateQuiz<T extends z.ZodType>(
    planId: string,
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>> {
    const questionArray = await this.questionArrayFromPlanId(planId);
    const response = await evaluateQuiz(
      lessonPlan,
      questionArray,
      1500,
      ratingSchema,
      quizType,
    );
    const rating = parsedResponse(ratingSchema, response);
    return rating;
  }

  // This may be horrendous
  // This takes the above function - decorates it with a random delay
  // Then processes it with an array of planIDS and calls randomly
  // Then rates the outputs of the schema and returns the highest rated ones index.
  public async planIdsToStarterQuizRatings<T extends z.ZodType>(
    planIds: string[],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
  ): Promise<number> {
    // TODO: Add error handling here.
    // Adds a random delay to the retrieval of the quiz from the planId
    const delayedRetrieveQuiz = withRandomDelay(
      async (planId: string) =>
        await this.retrieveQuizFromPlanIdAndRateStarterQuiz(
          planId,
          lessonPlan,
          ratingSchema,
        ),
      1000,
      5000,
    );
    // This takes the planIds and the delayedRetrieveQuiz function and calls the function with a random delay for each planId asynchronously.
    const ratings = await processArray(planIds, delayedRetrieveQuiz);

    const bestRating = selectHighestRated(ratings, (item) => item.rating);
    return bestRating;
  }

  /**
   * Takes generic rating schema and plan ids and returns the index of the highest rated quiz.
   * Automatically selects the correct system prompt for the quiz type.
   * @param planIds - The list of plan ids to retrieve quizzes from.
   * @param lessonPlan - The lesson plan to use for quiz retrieval.
   * @param ratingSchema - The rating schema to use for quiz retrieval.
   * @param quizType - The type of quiz to retrieve.
   * @returns The index of the highest rated quiz.
   */
  // TODO: add caching here.
  public async planIdsToQuizRatings<T extends z.ZodType>(
    planIds: string[],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<number> {
    const delayedRetrieveQuiz = withRandomDelay(
      async (planId: string) =>
        await this.retrieveQuizFromPlanIdAndRateQuiz(
          planId,
          lessonPlan,
          ratingSchema,
          quizType,
        ),
      1000,
      5000,
    );
    const ratings = await processArray(planIds, delayedRetrieveQuiz);
    const bestRating = selectHighestRated(ratings, (item) => item.rating);
    return bestRating;
  }

  //   const ratings = await processArray(
  //     planIds,
  //     await withRandomDelay(
  //       this.retrieveQuizFromPlanIdAndRateStarterQuiz,
  //       1000,
  //       5000,
  //     )(lessonPlan, ratingSchema),
  //   );
  //   const bestRating = selectHighestRated(ratings, (item) => item.rating);
  //   return bestRating;
  // }

  /**
   * Evaluates an array of quizzes and returns the index of the highest rated quiz. Used for combining openai assesments with traditional ML reranking.
   * @param quizArray - The array of quizzes to evaluate.
   * @param lessonPlan - The lesson plan to use for quiz evaluation.
   * @param ratingSchema - The rating schema to use for quiz evaluation.
   * @param quizType - The type of quiz to evaluate.
   * @returns The index of the highest rated quiz.
   */
  public async evaluateQuizArray<T extends z.ZodType>(
    quizArray: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<number> {
    const delayedRetrieveQuiz = withRandomDelay(
      async (quiz: QuizQuestion[]) =>
        await evaluateQuiz(lessonPlan, quiz, 1500, ratingSchema, quizType),
      1000,
      5000,
    );
    // TODO: decide if we want
    const ratings = await processArray(quizArray, delayedRetrieveQuiz);
    const bestRating = selectHighestRated(ratings, (item) => item.rating);
    return bestRating;
  }

  public async getSuitableRagLessonsToConsider(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizzesForConsideration> {
    // TODO: Implement this. Depends on the lesson plan having a relevant lessons field.
    // const relevantLessons: string[] = lessonPlan.relevantLessons || [];
    const basedOnId: string | undefined = lessonPlan.basedOn?.id;
    const ragLessonPlanIds: string[] = [];

    // const mlQuizQuestions: QuizQuestion[] = [];
    const mlQuizQuestions = await this.generateMathsQuizML(lessonPlan);

    return {
      basedOnId,
      ragLessonPlanIds,
      mlQuizQuestions,
    };
  }

  /**
   * Generates a quiz using a combined reranking method and puts it next to the OpenAI assesments.
   */
  public async combinedRerankingOpenAIMLQuizGeneration<T extends z.ZodType>(
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<QuizQuestion[]> {
    const quizArray: QuizQuestion[][] = [];

    const { basedOnId, ragLessonPlanIds, mlQuizQuestions } =
      await this.getSuitableRagLessonsToConsider(lessonPlan);

    if (!basedOnId) {
      console.log("Lesson Plan is not explicitly based on another lesson plan");
    } else {
      console.log("Lesson Plan is explicitly based on: ", basedOnId);
      const basedOnQuiz = await this.questionArrayFromPlanId(basedOnId);
      quizArray.push(basedOnQuiz);
    }

    if (ragLessonPlanIds.length === 0) {
      console.log("No relevant RAG lesson plans found");
    } else {
      console.log("Found relevant RAG lesson plans: ", ragLessonPlanIds);
      const ragQuizzes: QuizQuestion[][] = await Promise.all(
        ragLessonPlanIds.map(
          async (id) => await this.questionArrayFromPlanId(id),
        ),
      );
      quizArray.push(...ragQuizzes);
    }

    if (mlQuizQuestions.length === 0) {
      console.log("No ML quiz questions found");
    } else {
      console.log("Found ML quiz questions: ", mlQuizQuestions);
      quizArray.push(mlQuizQuestions);
    }

    const bestQuizIndex = await this.evaluateQuizArray(
      quizArray,
      lessonPlan,
      ratingSchema,
      quizType,
    );

    const bestQuiz = quizArray[bestQuizIndex];
    if (!bestQuiz) {
      throw new Error("No quiz found at the best index");
    }
    return bestQuiz;
  }

  // const questionArray = await this.questionArrayFromPlanId(basedOnId);
  // const rerankedResults = await this.rerankDocuments(questionArray, simplifiedResults);
}
