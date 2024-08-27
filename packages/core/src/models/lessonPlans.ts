import {
  KeyStage,
  Lesson,
  LessonPlan,
  LessonPlanPart,
  LessonPlanPartStatus,
  LessonPlanStatus,
  LessonSummary,
  PrismaClientWithAccelerate,
  Subject,
} from "@oakai/db";
import { Prisma } from "@prisma/client";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";
import yaml from "yaml";

import { inngest } from "../client";
import { createOpenAIClient } from "../llm/openai";
import { template } from "../prompts/lesson-assistant";
import { RAG } from "../rag";
import { embedWithCache } from "../utils/embeddings";
import { humanizeCamelCaseString } from "../utils/humanizeCamelCaseString";
import { Caption, CaptionsSchema } from "./types/caption";

// Simplifies the input to a string for embedding
export function textify(input: string | string[] | object): string {
  if (Array.isArray(input)) {
    return input.map((row) => textify(row)).join("\n");
  } else if (typeof input === "object") {
    return yaml.stringify(input);
  } else {
    return input;
  }
}

export type LessonPlanWithLesson = LessonPlan & {
  lesson: Omit<
    Lesson,
    | "content"
    | "captions"
    | "createdAt"
    | "updatedAt"
    | "keyStageName"
    | "subjectName"
  >;
};

type LessonWithKeyStageSubjectAndSummaries = Lesson & {
  keyStage: KeyStage | null;
  subject: Subject | null;
  summaries: LessonSummary[] | null;
};

type LessonPlanWithParts = LessonPlan & {
  parts: LessonPlanPart[] | null;
};

interface FilterOptions {
  key_stage_id?: object;
  subject_id?: object;
}

export class LessonPlans {
  private _rag: RAG;
  private _prisma: PrismaClientWithAccelerate;
  constructor(private readonly prisma: PrismaClientWithAccelerate) {
    this._prisma = prisma;
    this._rag = new RAG(this._prisma);
  }

  async embedAllParts(): Promise<void> {
    const lessonPlanParts = await this._prisma.lessonPlan.findMany({
      where: {
        status: LessonPlanPartStatus.PENDING,
      },
    });
    for (const lessonPlanPart of lessonPlanParts) {
      await inngest.send({
        name: "app/lessonPlan.embedPart",
        data: { lessonPlanPartId: lessonPlanPart.id },
      });
    }
  }

  async embedAll(): Promise<void> {
    const lessonPlans = await this._prisma.lessonPlan.findMany({
      where: {
        status: LessonPlanStatus.GENERATED,
      },
    });
    for (const lessonPlan of lessonPlans) {
      await inngest.send({
        name: "app/lessonPlan.embed",
        data: { lessonPlanId: lessonPlan.id },
      });
    }
  }

  async createFromLesson(id: string): Promise<LessonPlan> {
    const lesson: Lesson | null = await this._prisma.lesson.findUnique({
      where: { id },
    });
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    const lessonPlan = await this._prisma.lessonPlan.create({
      data: {
        lessonId: lesson.id,
        status: "PENDING",
        // Metadata for Langchain vector store
        subjectId: lesson.subjectId,
        keyStageId: lesson.keyStageId,
      },
    });

    await inngest.send({
      name: "app/lessonPlan.process",
      data: { lessonPlanId: lessonPlan.id },
    });

    return lessonPlan;
  }

  async generateContent(
    lessonPlanId: string,
  ): Promise<string | null | undefined> {
    const lessonPlan: LessonPlan | null =
      await this._prisma.lessonPlan.findUnique({
        where: { id: lessonPlanId },
      });
    if (!lessonPlan) {
      throw new Error("LessonPlan not found");
    }
    if (!lessonPlan?.lessonId) {
      throw new Error("Lesson not found");
    }
    const lesson: LessonWithKeyStageSubjectAndSummaries | null =
      await this._prisma.lesson.findUnique({
        where: { id: lessonPlan.lessonId },
        include: { keyStage: true, subject: true, summaries: true },
      });
    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const compiledTemplate = template({
      subject: lesson.subject?.title ?? "None",
      lessonTitle: lesson.title,
      keyStage: lesson.keyStage?.title ?? "None",
      topic: lesson.subject?.title ?? "None", // TODO: Ingest topics
      currentLessonPlan: JSON.stringify(lessonPlan),
      relevantLessonPlans: "None",
      summaries: "None",
      responseMode: "generate",
    });

    const systemPrompt = compiledTemplate;

    let validCaptions: Caption[] = [];
    try {
      validCaptions = CaptionsSchema.parse(lesson.captions);
    } catch (err) {
      console.error("Failed to parse captions", err);
    }

    const captionText = validCaptions.map((c) => c.part).join(" ");

    const summaries = lesson.summaries ?? [];

    const summary = summaries[0]; // TODO handle multiple types of summary

    const summaryOverview = summary
      ? `We have summarised the lesson to explain what it is about and its content. This may be helpful for you to generate the lesson plan.
    
    LESSON SUMMARY STARTS
    ${summary.content}
    LESSON SUMMARY ENDS
    
    TOPICS
    ${summary.topics.join(",")}.

    LEARNING OBJECTIVES
    ${summary.learningObjectives.join(". ")}.

    CONCEPTS
    ${summary.concepts.join(",")}.

    KEYWORDS
    ${summary.keywords.join(",")}.`
      : "There is no summary for this lesson";

    const userPrompt = `I would like to generate a lesson plan for the lesson titled ${lesson.title} for a lesson titled "${lesson.keyStage?.title ?? "Untitled"}" in ${lesson.subject?.title ?? "an unknown subject"}. 
    The lesson has the following transcript which is a recording of the lesson being delivered by a teacher. 
    I would like you to base your response on the content of the lesson rather than imagining other content that could be valid for a lesson with this title. 
    Think about the structure of the lesson based on the transcript and see if it can be broken up into logical sections which correspond to the definition of a learning cycle.
    The transcript may include introductory and exit quizzes, so include these if they are multiple choice. Otherwise generate the multiple choice quiz questions based on the content of the lesson.
    The transcript is as follows:
    
    LESSON TRANSCRIPT STARTS
    ${captionText}
    LESSON TRANSCRIPT ENDS
    
    The lesson may also have a summary that has been generated to summarise what the lesson is about.

    ${summaryOverview}`;

    const openai = createOpenAIClient({ app: "legacy-lesson-planner" });

    const res = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        { content: systemPrompt, role: "system" },
        { content: userPrompt, role: "user" },
      ],
      temperature: 0.7,
      stream: false,
      response_format: { type: "json_object" },
    });
    return res.choices[0]?.message.content;
  }

  async process(id: string): Promise<LessonPlan> {
    const lessonPlan = await this._prisma.lessonPlan.findUnique({
      where: { id },
      include: { lesson: true },
    });
    if (!lessonPlan) {
      throw new Error("Lesson summary not found");
    }

    const content = await this.generateContent(lessonPlan.id);

    console.log("Generated content", content);
    if (!content) {
      throw new Error("Unable to generate lesson summary");
    }

    const json = JSON.parse(content);

    await this._prisma.lessonPlan.update({
      where: { id },
      data: {
        status: LessonPlanStatus.GENERATED,
        content: json,
      },
    });

    for (const key of Object.keys(json).filter(
      (k) => !["subject", "keyStage"].includes(k),
    )) {
      // Ignore empty values
      if (["", "None", undefined, null].includes(json[key])) {
        break;
      }
      const existingPart = await this._prisma.lessonPlanPart.findFirst({
        where: {
          lessonPlanId: id,
          key,
        },
      });
      let newPart: LessonPlanPart | null = null;
      if (!existingPart) {
        newPart = await this._prisma.lessonPlanPart.create({
          data: {
            lessonPlanId: lessonPlan.id,
            key: key,
            content: textify(json[key]),
            json: json[key],
            subjectId: lessonPlan.lesson?.subjectId,
            keyStageId: lessonPlan.lesson?.keyStageId,
          },
        });
      }
      const part = existingPart ?? newPart;
      if (!part) {
        throw new Error("No lesson part found or created");
      }
      if (part.status !== LessonPlanPartStatus.SUCCESS) {
        // Do not put these onto a background queue and execute inline
        // If these fail, we will rerun the entire embedding task for the lesson plan
        await this.embedPart(part);
      }
    }
    return lessonPlan;
  }

  async embedPart(part: LessonPlanPart): Promise<number> {
    const text = `${part.key}
    
${part.content}`;

    const embeddings = await embedWithCache(text);
    if (!embeddings || embeddings.length === 0) {
      throw new Error("Unable to embed lesson plan part");
    }
    const vector = `[${embeddings.join(",")}]`;
    const result = await this._prisma.$executeRaw`
      UPDATE lesson_plan_parts
      SET embedding = ${vector}::vector, status = 'SUCCESS'
      WHERE id = ${part.id}`;
    return result;
  }

  async embed(id: string): Promise<number> {
    const lessonPlan: LessonPlanWithParts | null =
      await this._prisma.lessonPlan.findUnique({
        where: { id },
        include: { parts: true },
      });
    if (!lessonPlan) {
      throw new Error("Lesson plan not found");
    }
    if (!lessonPlan.parts) {
      throw new Error("Lesson plan parts not found");
    }
    const text = lessonPlan.parts
      .map(
        (p) => `${humanizeCamelCaseString(p.key)}
${p.content}`,
      )
      .join("\n\n");
    const embeddings = await embedWithCache(text);
    if (!embeddings || embeddings.length === 0) {
      throw new Error("Unable to embed lesson plan");
    }
    const vector = `[${embeddings.join(",")}]`;
    const result = await this._prisma.$executeRaw`
      UPDATE lesson_plans
      SET embedding = ${vector}::vector, status = 'SUCCESS'
      WHERE id = ${id}`;
    return result;
  }

  async search(
    query: string,
    keyStage: string | undefined,
    subject: string | undefined,
    perPage: number,
  ): Promise<LessonPlanWithLesson[]> {
    const filter: FilterOptions = {};

    if (keyStage) {
      const keyStageRecord = await this._rag.fetchKeyStage(keyStage);

      if (keyStageRecord) {
        filter["key_stage_id"] = {
          equals: keyStageRecord.id,
        };
      }
    }
    if (subject) {
      const subjectRecord = await this._rag.fetchSubject(subject);
      if (subjectRecord) {
        filter["subject_id"] = {
          equals: subjectRecord.id,
        };
      }
    }
    const vectorStore = PrismaVectorStore.withModel<LessonPlan>(
      this._prisma,
    ).create(new OpenAIEmbeddings(), {
      prisma: Prisma,
      tableName: "lesson_plans" as "LessonPlan",
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
      // @ts-expect-error TODO Bug in PrismaVectorStore which doesn't allow mapped column names
      filter,
    });
    const result = await vectorStore.similaritySearch(query, perPage);

    const lessonPlans: LessonPlanWithLesson[] =
      await this._prisma.lessonPlan.findMany({
        where: {
          id: { in: result.map((r) => r.metadata.id) },
        },
        include: {
          lesson: {
            select: {
              id: true,
              slug: true,
              title: true,
              subjectId: true,
              keyStageId: true,
              isNewLesson: true,
              newLessonContent: true,
            },
          },
        },
      });

    const hydrated: LessonPlanWithLesson[] = [];
    for (const entry of result) {
      const lessonPlan = lessonPlans.find((ls) => ls.id === entry.metadata.id);
      if (!lessonPlan) {
        throw new Error("Lesson summary not found");
      }
      hydrated.push(lessonPlan);
    }
    return hydrated;
  }
}
