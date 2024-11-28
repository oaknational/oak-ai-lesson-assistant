import type {
  KeyStage,
  Lesson,
  LessonPlan,
  LessonPlanPart,
  LessonSummary,
  PrismaClientWithAccelerate,
  Subject,
} from "@oakai/db";
import { LessonPlanPartStatus, LessonPlanStatus } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { LLMResponseJsonSchema } from "../../../aila/src/protocol/jsonPatchProtocol";
import { LessonPlanJsonSchema } from "../../../aila/src/protocol/schema";
import { inngest } from "../inngest";
import { createOpenAIClient } from "../llm/openai";
import { template } from "../prompts/lesson-assistant";
import { RAG } from "../rag";
import { camelCaseToSentenceCase } from "../utils/camelCaseConversion";
import { embedWithCache } from "../utils/embeddings";
import { textify } from "../utils/textify";
import type { Caption } from "./types/caption";
import { CaptionsSchema } from "./types/caption";

const log = aiLogger("lessons");

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

export class LessonPlans {
  private readonly _rag: RAG;
  private readonly _prisma: PrismaClientWithAccelerate;
  constructor(private readonly prisma: PrismaClientWithAccelerate) {
    this._prisma = prisma;
    this._rag = new RAG(this._prisma, { chatId: "none" });
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
      lessonPlan: {},
      relevantLessonPlans: "None",
      summaries: "None",
      responseMode: "generate",
      lessonPlanJsonSchema: JSON.stringify(LessonPlanJsonSchema),
      llmResponseJsonSchema: JSON.stringify(LLMResponseJsonSchema),
      isUsingStructuredOutput:
        process.env.NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED === "true",
    });

    const systemPrompt = compiledTemplate;

    let validCaptions: Caption[] = [];
    try {
      validCaptions = CaptionsSchema.parse(lesson.captions);
    } catch (err) {
      log.error("Failed to parse captions", err);
    }

    const captionText = validCaptions.map((c) => c.part).join(" ");

    const keyStageName = lesson.keyStage?.title ?? "an unknown key stage";
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

    const userPrompt = `I would like to generate a lesson plan for a lesson titled "${lesson.title}" in ${lesson.subject?.title ?? "an unknown subject"} at ${keyStageName}. 
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

    log.info("Generated content", content);
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
        (p) => `${camelCaseToSentenceCase(p.key)}
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
}
