import { Lesson, LessonSummary, PrismaClientWithAccelerate } from "@oakai/db";
import { Prisma } from "@prisma/client";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";

import { inngest } from "../client";
import { RAG } from "../rag";
import { embedWithCache } from "../utils/embeddings";

export type LessonSummaryWithLesson = LessonSummary & {
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

interface FilterOptions {
  key_stage_id?: object;
  subject_id?: object;
}
export class LessonSummaries {
  private _rag: RAG;
  private _prisma: PrismaClientWithAccelerate;
  constructor(private readonly prisma: PrismaClientWithAccelerate) {
    this._prisma = prisma;
    this._rag = new RAG(this._prisma, { chatId: "none" });
  }

  async embedAll(): Promise<void> {
    const lessonSummaries = await this._prisma.lessonSummary.findMany({
      where: {
        status: "GENERATED",
      },
    });
    for (const lessonSummary of lessonSummaries) {
      await inngest.send({
        name: "app/lessonSummary.embed",
        data: { lessonSummaryId: lessonSummary.id },
      });
    }
  }

  async embed(id: string): Promise<number> {
    const lessonSummary = await this._prisma.lessonSummary.findUnique({
      where: { id },
    });
    if (!lessonSummary) {
      throw new Error("Lesson summary not found");
    }
    if (!lessonSummary.content) {
      throw new Error("Lesson summary content not found");
    }
    const text = [
      lessonSummary.content,
      lessonSummary.topics,
      lessonSummary.learningObjectives,
      lessonSummary.concepts,
      lessonSummary.keywords,
    ].join(" | ");
    const embeddings = await embedWithCache(text);
    if (!embeddings || embeddings.length === 0) {
      throw new Error("Unable to embed snippet");
    }
    const vector = `[${embeddings.join(",")}]`;
    const result = await this._prisma.$executeRaw`
      UPDATE lesson_summaries
      SET embedding = ${vector}::vector
      WHERE id = ${id}`;
    return result;
  }

  async search(
    query: string,
    keyStage: string | undefined,
    subject: string | undefined,
    perPage: number,
  ): Promise<LessonSummaryWithLesson[]> {
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
    const vectorStore = PrismaVectorStore.withModel<LessonSummary>(
      this._prisma,
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
    const result = await vectorStore.similaritySearch(query, perPage);

    const lessonSummaries: LessonSummaryWithLesson[] =
      await this._prisma.lessonSummary.findMany({
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

    const hydrated: LessonSummaryWithLesson[] = [];
    for (const entry of result) {
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
}
