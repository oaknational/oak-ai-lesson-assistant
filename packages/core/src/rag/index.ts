import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import {
  KeyStage,
  LessonPlanPart,
  PrismaClientWithAccelerate,
  Subject,
} from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import {
  LessonPlan,
  LessonSummary,
  Prisma,
  PrismaClient,
  Snippet,
} from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as Sentry from "@sentry/nextjs";
import { kv } from "@vercel/kv";
import { CohereClient } from "cohere-ai";
import { RerankResponse } from "cohere-ai/api";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Md5 } from "ts-md5";
import z from "zod";

import { DEFAULT_CATEGORISE_MODEL } from "../../../aila/src/constants";
import {
  OpenAICompletionWithLogging,
  OpenAICompletionWithLoggingOptions,
} from "../../../aila/src/lib/openai/OpenAICompletionWithLogging";
import { JsonValue } from "../models/prompts";
import { slugify } from "../utils/slugify";
import { keyStages, subjects } from "../utils/subjects";

const log = aiLogger("rag");

interface FilterOptions {
  key_stage_id?: object;
  subject_id?: object;
}

export interface LessonPlanWithPartialLesson extends LessonPlan {
  lesson: {
    id: string;
    slug: string;
    title: string;
  };
}

export type SimilarityResultWithScore = [
  import("@langchain/core/documents").DocumentInterface<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  >,
  number,
];

export interface KeyStageAndSubject {
  keyStage?: KeyStage;
  subject?: Subject;
}

// Make a new Zod schema for a response from OpenAI for the categoriseKeyStageAndSubject function

export const CategoriseKeyStageAndSubjectResponse = z.object({
  keyStage: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  topic: z.string().optional().nullable(),
  error: z.string().optional(),
  reasoning: z.string().optional().nullable(),
});

export type CategorisedKeyStageAndSubject = z.infer<
  typeof CategoriseKeyStageAndSubjectResponse
>;

export class RAG {
  prisma: PrismaClientWithAccelerate;
  private _chatMeta: OpenAICompletionWithLoggingOptions;
  constructor(
    prisma: PrismaClientWithAccelerate,
    chatMeta: OpenAICompletionWithLoggingOptions,
  ) {
    this.prisma = prisma;
    this._chatMeta = chatMeta;
  }

  async categoriseKeyStageAndSubject(
    input: string,
    chatMeta: OpenAICompletionWithLoggingOptions,
  ) {
    log.info("Categorise input", JSON.stringify(input));

    const systemMessage = `You are a classifier which can help me categorise the intent of the user's input for an application which helps a teacher build a lesson plan their students in a UK school.
You accept a string as input and return an object with the keys keyStage, subject, title and topic.

USER INPUT
The user will likely be starting to make a new lesson plan and this may be their first interaction with the system. So it's likely that the text will include introductory information, such as "Hello, I would like you to make a lesson about {title} for {key stage} students in {subject}." or "I need a lesson plan for {title} for {subject} students in {key stage}." The user may also include a topic for the lesson plan, such as "I need a lesson plan for {title} for {subject} students in {key stage} about {topic}."
The input will be highly variable, so you should be able to handle a wide range of inputs, and extract the relevant information from the input.

KEY STAGE SLUGS
The following are the key stages you can use to categorise the input. Each of these is slug which we use in the database to refer to them:
${keyStages.join("\n")}

SUBJECT SLUGS
The following are the subjects you can use to categorise the input. Each of these is a slug which we use in the database to refer to them:
${subjects.join("\n")}

LESSON TITLES
The title of the lesson plan is the title of the lesson plan that the user wants to create. This could be anything, but it will likely be a short phrase or sentence that describes the topic of the lesson plan.
Do not include "Lesson about" or "…Lesson" in the title. The title should be the standalone main topic of the lesson plan and not mention the word Lesson. It will be used as the title of the lesson plan in our database and displayed to the user in an overview document.

RETURNED OBJECT
The object you return should have the following shape:
{
  reasoning: string, // Why you have chosen to categorise the input in the way that you have
  keyStage: string, // The slug of the key stage that the input is relevant to
  subject: string, // The slug of the subject that the input is relevant to
  title: string, // The title of the lesson plan
  topic: string // The topic of the lesson plan
}

GUESSING AN APPROPRIATE KEY STAGE, SUBJECT OR TOPIC WHEN NOT SPECIFIED
Where not specified by the user, you should attempt to come up with a reasonable title, key stage, subject and topic based on the input from the user.
For instance, "Plate tectonics" is obviously something covered in Geography and based on your knowledge of the UK education system I'm sure you know that this is often taught in Key Stage 2.
Imagine that you are a teacher who is trying to categorise the input. 
You should use your knowledge of the UK education system to make an educated guess about the key stage and subject that the input is relevant to.

EXAMPLE ALIASES

Often, teachers will use shorthand to refer to a key stage or subject. For example, "KS3" is often used to refer to "Key Stage 3". You should be able to handle these aliases and return the correct slug for the key stage or subject.
The teacher might also say "Year 10". You should be able to handle this and return the correct slug for the key stage based on the teaching years that are part of the Key Stages in the UK National Curriculum.
For subjects, you should also be able to handle the plural form of the subject. For example, "Maths" should be categorised as "maths" and "Mathematics" should be categorised as "maths".
"PSHE" is often used to refer to "Personal, Social, Health and Economic education" and maps to "psed" in our database.
"PE" is often used to refer to "Physical Education". 
"DT" is often used to refer to "Design and Technology".
"RSHE" is often used as a synonym for "PSHE" and "PSED" and maps to "rshe-pshe" in our database.
You should be able to handle any of these aliases and return the correct slug for the subject.
For computing we have both "GCSE" and "non-GCSE". By default, assume that the input is relevant to the GCSE computing curriculum. If the input is relevant to the non-GCSE computing curriculum, the user will specify this in the input.

PROVIDING REASONING
When key stage, subject and topic are not provided by the user, it may be helpful to write out your reasoning for why you think the input relates to a particular key stage, subject or topic. Start with this reasoning in your response and write out why you think that the input is relevant to the key stage, subject and topic that you have chosen. This will help us to understand your thought process and improve the system in the future.

BRITISH ENGLISH
The audience for your categorisation is teachers in the UK, so you should use British English when responding to the user. For example, use "Maths" instead of "Math" and "Key Stage 3" instead of "Grade 3".
If the user has provided a title or topic that is in American English, you should still respond with the British English equivalent. For example, if the user has provided the subject "Math" you should respond with "Maths". Or if the user has provided the title "Globalization" you should respond with "Globalisation".

RESPONDING TO THE USER
All keys are optional but always prefer sending back a keyStage or subject if you are able to take a good guess at what would be appropriate values. If you are *REALLY* not able to determine the key stage or subject, you can return null for these values, but only do so as a last resort! If you are not able to determine the title or topic, you can return null for these values.
Always respond with a valid JSON document. If you are not able to respond for some reason, respond with another valid JSON document with the keys set to null and an "error" key with the value specifying the reason for the error.
Never respond with slugs that are not in the list of slugs provided above. If you are not able to categorise the input, return null for the key stage and subject. This is very important! We use the slugs to categorise the input in our database, so if you return a slug that is not in the list above, we will not be able to categorise the input correctly.
Do not respond with any other output than the object described above. If you do, the system will not be able to understand your response and will not be able to categorise the input correctly.
Thank you and happy classifying!`;

    const promptVersion = Md5.hashStr(systemMessage);
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      { role: "user", content: input },
    ];

    // #TODO This is the only place where we use this old OpenAICompletionWithLogging
    // We should be using methods on the Aila instance instead
    const { completion } = await OpenAICompletionWithLogging(
      {
        ...chatMeta,
        promptVersion,
        prompt: "categorise_key_stage_and_subject",
      },
      {
        model: DEFAULT_CATEGORISE_MODEL,
        stream: false,
        messages,
        response_format: { type: "json_object" },
      },
    );

    try {
      const content = completion.choices?.[0]?.message.content;
      if (!content) return { error: "No content in response" };

      const parsedResponse = CategoriseKeyStageAndSubjectResponse.parse(
        JSON.parse(content),
      );
      log.info("Categorisation results", parsedResponse);
      return parsedResponse;
    } catch (e) {
      return { error: "Error parsing response" };
    }
  }

  async fetchContent({
    chatId,
    keyStage,
    subject,
    title,
    k,
  }: {
    chatId: string;
    keyStage: string;
    subject: string;
    title: string;
    k: number;
  }): Promise<string | undefined> {
    const hash = Md5.hashStr(`${keyStage}-${subject}-${title}`);
    const key = `chat:rag:${chatId}:${hash}`;
    const cached = await kv.get(key);
    if (cached) {
      return cached as string;
    }
    const snippets = await this.search(title, keyStage, subject, k);
    const contentArray = snippets.map((s) => s.content);
    const uniqueContentArray = contentArray.filter(
      (value, index, self) => self.indexOf(value) === index,
    );
    const content = uniqueContentArray.join("\n");
    await kv.set(key, content, {
      ex: process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? 0 : 60 * 15,
    });
    return content;
  }

  async fetchSummaries({
    chatId,
    keyStage,
    subject,
    title,
    k,
  }: {
    chatId: string;
    keyStage: string;
    subject: string;
    title: string;
    k: number;
  }): Promise<string | undefined> {
    const hash = Md5.hashStr(`${keyStage}-${subject}-${title}`);
    const key = `rag:summaries:${chatId}:${hash}`;
    const cached = await kv.get(key);
    if (cached) {
      return cached as string;
    }
    const summaries = await this.searchLessonSummaries(
      title,
      keyStage,
      subject,
      k,
    );
    const content = Array.from(new Set(summaries.map((s) => s.id)))
      .map((id) => summaries.find((s) => s.id === id))
      .map((s) => JSON.stringify(s, null, 2))
      .join("\n");
    await kv.set(key, content);
    return content;
  }

  async removeCachedValueByHash(
    keyPrefix: string,
    hashInput: string,
  ): Promise<number> {
    const hash = Md5.hashStr(hashInput);
    const key = `${keyPrefix}:${hash}`;
    const result = await kv.del(key);
    return result;
  }

  async getCachedValueByHash(
    keyPrefix: string,
    hashInput: string,
  ): Promise<string | object | null> {
    try {
      const hash = Md5.hashStr(hashInput);
      const key = `${keyPrefix}:${hash}`;
      const result: string | object | null = await kv.get(key);
      log.info("getCachedValueByHash: Got result!", result);
      return result;
    } catch (e) {
      log.error("Error getting cached value by hash", e);
      throw e;
    }
  }

  async getCachedSerialisedByHash<T>(
    keyPrefix: string,
    hashInput: string,
  ): Promise<T | null> {
    log.info("getCachedValueByHash", keyPrefix, hashInput);
    const cachedValue = await this.getCachedValueByHash(keyPrefix, hashInput);
    log.info("Got cached value", { cachedValue });
    if (
      typeof cachedValue === "string" &&
      cachedValue?.includes("[object Object")
    ) {
      log.info("Removing cached value because it has badly serialised");
      await this.removeCachedValueByHash(keyPrefix, hashInput);
      return null;
    }
    if (cachedValue) {
      log.info("Got cached serialised by hash", { cachedValue });
      log.info("Typeof cachedValue", typeof cachedValue);
      if (typeof cachedValue === "string") {
        return JSON.parse(cachedValue) as T;
      }
      if (typeof cachedValue === "object") {
        return cachedValue as T;
      }
      return cachedValue as T;
    } else {
      return null;
    }
  }

  async setCachedSerialisedByHash<T>(
    keyPrefix: string,
    hashInput: string,
    value: T,
    options = {},
  ): Promise<string | null> {
    log.info("Set cached serialised by hash", {
      keyPrefix,
      hashInput,
      //value,
    });

    const stringified = JSON.stringify(value);
    if (stringified.includes("[object Object")) {
      throw new Error("Serialized as object Object");
    }
    const result = await this.setCachedValueByHash(
      keyPrefix,
      hashInput,
      stringified,
      options,
    );
    return result;
  }

  async setCachedValueByHash(
    keyPrefix: string,
    hashInput: string,
    value: string,
    options = {},
  ): Promise<string | null> {
    const hash = Md5.hashStr(hashInput);
    const key = `${keyPrefix}:${hash}`;
    const result = await kv.set(key, value, options);
    return result;
  }

  // Use this to manipulate the content of a lesson plan into the expected shape
  // before doing the full migration on the data in the database
  normaliseLessonPlanContent(
    content?: object | JsonValue | string | null,
  ): string {
    // Bad logic - it will change description on misconceptions
    // if (typeof content === "string") {
    //   // Some records are returning the wrong key for keywords
    //   return content?.replaceAll('"description"', '"definition"') ?? null;
    // }
    if (typeof content === "object") {
      return this.normaliseLessonPlanContent(JSON.stringify(content));
    }
    return JSON.stringify(content);
  }

  normaliseLessonPlan(plan: LessonPlan) {
    return plan;
    // return {
    //   ...plan,
    //   content: JSON.parse(this.normaliseLessonPlanContent(plan.content)),
    // };
  }

  async fetchLessonPlans({
    chatId,
    keyStage,
    subject,
    title,
    topic,
    k, // #TODO refactor this to have a more explanatory name, eg. numberToFetch
    withCaching = true,
  }: {
    chatId: string;
    keyStage?: string;
    subject?: string;
    title: string;
    topic?: string;
    k: number;
    withCaching?: boolean;
  }): Promise<LessonPlan[]> {
    const cacheHash = `${keyStage}-${subject}-${title}-${topic}-${k}`;
    const cacheKey = `rag:plans:${chatId}`;
    log.info("getCachedSerialisedByHash");
    const cached = await this.getCachedSerialisedByHash<LessonPlan[]>(
      cacheKey,
      cacheHash,
    );

    if (cached && withCaching) {
      log.info("normaliseLessonPlan");
      return cached; //.map((p) => this.normaliseLessonPlan(p));
    }

    if (cached && !withCaching) {
      log.info("Fetch Lessons: Cache hit but not using cache", {
        cacheKey,
        cacheHash,
      });
    }

    let plans: LessonPlan[] = [];

    try {
      const rag = new RAG(this.prisma, { chatId });
      plans = await rag.searchLessonPlans({
        title,
        keyStage,
        subject,
        topic,
        k,
      });
    } catch (e) {
      log.error(e);
      Sentry.captureException(e);
    }

    log.info("Got plans", { planIds: plans.map((p) => p.id) });

    if (plans.length === 0 || !plans?.filter) {
      return []; // Do not cache empty results
    }
    const content: LessonPlan[] = Array.from(
      new Set(plans.filter((i) => i.id).map((s) => s.id)),
    )
      .map((id) => plans.find((s) => s.id === id))
      .filter((i) => typeof i !== "undefined") as LessonPlan[];
    await this.setCachedSerialisedByHash<LessonPlan[]>(
      cacheKey,
      cacheHash,
      content,
    );
    return content;
  }

  async searchLessonSummaries(
    query: string,
    keyStage: string | undefined,
    subject: string | undefined,
    perPage: number,
  ): Promise<
    LessonSummary[]

    // & {
    //   lesson: Omit<
    //     Lesson,
    //     | 'content'
    //     | 'captions'
    //     | 'createdAt'
    //     | 'updatedAt'
    //     | 'keyStageName'
    //     | 'subjectName'
    //   >
    // }
  > {
    const filter: FilterOptions = {};

    const keyStageAndSubject = await this.fetchFuzzyKeyStageAndSubject({
      keyStage,
      subject,
    });
    if (keyStageAndSubject.keyStage) {
      filter["key_stage_id"] = {
        equals: keyStageAndSubject.keyStage.id,
      };
    }
    if (keyStageAndSubject.subject) {
      filter["subject_id"] = {
        equals: keyStageAndSubject.subject.id,
      };
    }

    const vectorStore = PrismaVectorStore.withModel<LessonSummary>(
      this.prisma,
    ).create(new OpenAIEmbeddings(), {
      prisma: Prisma,
      tableName: "lesson_summaries" as "LessonSummary",
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
      // @ts-expect-error TODO Bug in PrismaVectorStore which doesn't allow mapped column names
      filter,
    });
    const result = await vectorStore.similaritySearchWithScore(query, perPage);

    const relevantResults = result.filter((r) => r[1] > 0.8).map((r) => r[0]);

    if (relevantResults.length === 0) {
      return [];
    }

    const lessonSummaries = await this.prisma.lessonSummary.findMany({
      where: {
        id: { in: relevantResults.map((r) => r.metadata.id) },
      },
      // include: {
      //   lesson: {
      //     select: {
      //       id: true,
      //       slug: true,
      //       title: true,
      //       subjectId: true,
      //       keyStageId: true,
      //       isNewLesson: true,
      //       newLessonContent: true
      //     }
      //   }
      // }
    });

    const hydrated: LessonSummary[] = [];
    for (const entry of relevantResults) {
      const lessonSummary = lessonSummaries.find(
        (ls) => ls.id === entry.metadata.id,
      );
      if (!lessonSummary) {
        throw new Error("Lesson summary not found");
      }
      hydrated.push(lessonSummary);
    }
    return hydrated;
  }

  async fetchCachedValueWithFetcher<T>(
    keyPrefix: string,
    hashInput: string,
    fetcher: () => Promise<T | null>,
    cacheExpiry: number = 60 * 60, // default to 1 hour
  ): Promise<T | null> {
    const hash = Md5.hashStr(hashInput);
    const cacheKey = `${keyPrefix}:${hash}`;
    try {
      const cached = await kv.get<T>(cacheKey);
      if (cached) {
        log.info(`Cache hit for key: ${cacheKey}`);
        return cached;
      }
    } catch (e) {
      log.error(`Error getting cached value for key: ${cacheKey}`, e);
      await kv.del(cacheKey); // Remove potentially corrupted cache entry
    }

    log.info(`Cache miss for key: ${cacheKey}, fetching from Prisma`);
    const record = await fetcher();
    if (record) {
      await kv.set<T>(cacheKey, record, { ex: cacheExpiry });
    }
    return record;
  }

  async fetchFuzzyKeyStageAndSubject({
    keyStage,
    subject,
  }: {
    keyStage?: string;
    subject?: string;
  }): Promise<KeyStageAndSubject> {
    // Create a combined hash for both keyStage and subject
    const combinedHash = Md5.hashStr(`${keyStage}-${subject}`);
    const cacheKeyPrefix = "fuzzyKeyStageAndSubject";

    // Try to get the combined result from the cache
    const cachedResult =
      await this.fetchCachedValueWithFetcher<KeyStageAndSubject>(
        cacheKeyPrefix,
        combinedHash,
        async () => {
          const [keyStageRecord, subjectRecord] = await Promise.all([
            this.fetchKeyStage(keyStage),
            this.fetchSubject(subject),
          ]);
          return {
            keyStage: keyStageRecord ?? undefined,
            subject: subjectRecord ?? undefined,
          };
        },
      );

    return cachedResult ?? { keyStage: undefined, subject: undefined };
  }

  // Open AI seems to sometimes use slugs, sometimes use titles
  async fetchKeyStage(keyStage?: string): Promise<KeyStage | null> {
    if (!keyStage) {
      return null;
    }
    let cachedKeyStage: KeyStage | null;
    try {
      cachedKeyStage = await kv.get<KeyStage>(`keyStage:${keyStage}`);
      if (cachedKeyStage) {
        return cachedKeyStage;
      }
    } catch (e) {
      log.error(
        "Error parsing cached keyStage. Continuing without cached value",
        e,
      );
      await kv.del(`keyStage:${keyStage}`);
    }

    let foundKeyStage: KeyStage | null = null;
    foundKeyStage = await this.prisma.keyStage.findFirst({
      where: {
        OR: [
          { slug: keyStage },
          { title: keyStage },
          { slug: slugify(keyStage) },
          { title: { equals: keyStage.toLowerCase(), mode: "insensitive" } },
          { slug: { equals: keyStage.toLowerCase(), mode: "insensitive" } },
        ],
      },
      cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
    });
    if (!foundKeyStage) {
      const categorisation = await this.categoriseKeyStageAndSubject(
        keyStage,
        this._chatMeta,
      );
      if (categorisation.keyStage) {
        foundKeyStage = await this.prisma.keyStage.findFirst({
          where: {
            slug: categorisation.keyStage,
          },
          cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
        });
      }
    }
    if (foundKeyStage) {
      await kv.set<KeyStage>(`keyStage:${keyStage}`, foundKeyStage, {
        ex: 60 * 60,
      });
    }
    return foundKeyStage;
  }

  async fetchSubject(theSubject?: string): Promise<Subject | null> {
    if (!theSubject) {
      return null;
    }
    const subject = theSubject.trim();
    let cachedSubject: Subject | null;
    try {
      cachedSubject = await kv.get<Subject>(`subject:${subject}`);
      if (cachedSubject) {
        return cachedSubject;
      }
    } catch (e) {
      log.error(
        "Error parsing cached subject. Continuing without cached value",
        e,
      );
      await kv.del(`subject:${subject}`);
    }

    let foundSubject: Subject | null = null;
    foundSubject = await this.prisma.subject.findFirst({
      where: {
        OR: [
          { slug: subject },
          { title: subject },
          { slug: slugify(subject).toLowerCase() },
          { slug: subject.toLowerCase() },
          { slug: { equals: subject.toLowerCase(), mode: "insensitive" } },
          { title: subject.toLowerCase() },
          { title: { equals: subject.toLowerCase(), mode: "insensitive" } },
        ],
      },
      cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
    });

    // If none of that works, fall back to categorising the subject based on free text
    if (!foundSubject) {
      //  log.info(
      //   "No subject found. Categorise the input to try to work out what it is using categoriseKeyStageAndSubject",
      // );
      const categorisation = await this.categoriseKeyStageAndSubject(
        subject,
        this._chatMeta,
      );
      if (categorisation.subject) {
        foundSubject = await this.prisma.subject.findFirst({
          where: {
            slug: categorisation.subject,
          },
          cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
        });
      }
    }
    if (foundSubject) {
      await kv.set<Subject>(`subject:${subject}`, foundSubject, {
        ex: 60 * 60,
      });
    }
    return foundSubject;
  }

  async searchLessonPlans({
    title,
    keyStage,
    subject,
    topic,
    k = 20,
  }: {
    title: string;
    keyStage: string | undefined;
    subject: string | undefined;
    topic: string | undefined;
    k: number;
  }): Promise<LessonPlan[]> {
    const filter: FilterOptions = {};

    const keyStageAndSubject = await this.fetchFuzzyKeyStageAndSubject({
      keyStage,
      subject,
    });
    if (keyStageAndSubject.keyStage) {
      filter["key_stage_id"] = {
        equals: keyStageAndSubject.keyStage.id,
      };
    }
    if (keyStageAndSubject.subject) {
      filter["subject_id"] = {
        equals: keyStageAndSubject.subject.id,
      };
    }

    const vectorStore = PrismaVectorStore.withModel<LessonPlanPart>(
      this.prisma,
    ).create(
      new OpenAIEmbeddings({
        modelName: "text-embedding-3-large",
        dimensions: 256,
      }),
      {
        prisma: Prisma,
        tableName: "lesson_plan_parts" as "LessonPlanPart",
        vectorColumnName: "embedding",
        verbose: true,
        openAIApiKey: process.env.OPENAI_API_KEY,
        columns: {
          id: PrismaVectorStore.IdColumn,
          lesson_plan_id: PrismaVectorStore.IdColumn,
          content: PrismaVectorStore.ContentColumn,
        },
        // @ts-expect-error TODO Bug in PrismaVectorStore which doesn't allow mapped column names
        filter,
      },
    );

    const similaritySearchTerm = topic ? `${title}. ${topic}` : title;

    let result: SimilarityResultWithScore[] | undefined = undefined;
    try {
      result = await vectorStore.similaritySearchWithScore(
        similaritySearchTerm,
        k * 5, // search for more records than we need
      );
    } catch (e) {
      if (e instanceof TypeError && e.message.includes("join([])")) {
        log.warn("Caught TypeError with join([]), returning empty array");
        return [];
      }
      throw e;
    }

    const relevantResults = result.filter((r) => r[1] > 0.1).map((r) => r[0]);

    if (relevantResults.length === 0) {
      // Avoids a TypeError when there are no relevant results
      return [];
    }
    const lessonPlans: LessonPlanWithPartialLesson[] =
      await this.prisma.lessonPlan.findMany({
        where: {
          id: { in: relevantResults.map((r) => r.metadata.lesson_plan_id) },
        },
        include: {
          lesson: {
            select: {
              id: true,
              slug: true,
              title: true,
              subjectId: true,
              keyStageId: true,
            },
          },
        },
      });

    // Return early - Cohere does not allow empty arrays
    if (lessonPlans.length === 0) {
      return [];
    }

    // Rerank with Cohere

    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY as string,
    });

    const rerankQuery = [title, topic].filter((t) => t).join(". ");
    const rerank: RerankResponse = await cohere.rerank({
      documents: lessonPlans.map((h) => {
        return { text: JSON.stringify(h.content) };
      }),
      returnDocuments: false,
      query: rerankQuery,
      topN: k,
    });
    const mostRelevantHydrated = rerank.results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map((r) => {
        const lessonPlan = lessonPlans[r.index];
        if (!lessonPlan) {
          throw new Error(`Lesson plan not found at index ${r.index}`);
        }
        return this.normaliseLessonPlan(lessonPlan);
      })
      .slice(0, k);
    // Limit to k results
    return mostRelevantHydrated;
  }

  async search(
    query: string,
    keyStage: string | undefined,
    subject: string | undefined,
    perPage: number,
  ) {
    const prisma: PrismaClientWithAccelerate = new PrismaClient().$extends(
      withAccelerate(),
    );

    const filter: FilterOptions = {};

    const keyStageAndSubject = await this.fetchFuzzyKeyStageAndSubject({
      keyStage,
      subject,
    });
    if (keyStageAndSubject.keyStage) {
      filter["key_stage_id"] = {
        equals: keyStageAndSubject.keyStage.id,
      };
    }
    if (keyStageAndSubject.subject) {
      filter["subject_id"] = {
        equals: keyStageAndSubject.subject.id,
      };
    }

    const vectorStore = PrismaVectorStore.withModel<Snippet>(prisma).create(
      new OpenAIEmbeddings(),
      {
        prisma: Prisma,
        tableName: "snippets" as "Snippet",
        vectorColumnName: "embedding",
        columns: {
          id: PrismaVectorStore.IdColumn,
          content: PrismaVectorStore.ContentColumn,
        },
        // @ts-expect-error TODO Bug in PrismaVectorStore which doesn't allow mapped column names
        filter,
      },
    );

    const result = await vectorStore.similaritySearchWithScore(query, perPage);

    const relevantResults = result.filter((r) => r[1] > 0.1).map((r) => r[0]);
    const snippets = await this.prisma.snippet.findMany({
      where: {
        id: { in: relevantResults.map((r) => r.metadata.id) },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            keyStageId: true,
            subjectId: true,
          },
        },
      },
    });

    const hydrated: Snippet[] = [];
    for (const entry of relevantResults) {
      const snippet = snippets.find((ls) => ls.id === entry.metadata.id);
      if (!snippet) {
        throw new Error("Snippet not found");
      }
      if (!hydrated.find((h) => h.id === snippet.id)) {
        hydrated.push(snippet);
      }
    }
    return hydrated;
  }
}
