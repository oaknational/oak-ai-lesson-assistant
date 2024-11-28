import { Lessons, inngest } from "@oakai/core";
import type { LessonSummary, Transcript } from "@oakai/db";
import { LessonWithSnippets } from "@oakai/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { removeProperty } from "../remove-props";
import { router } from "../trpc";

type TranscriptResult = {
  raw: string;
};

type SimilarityResult = {
  id: string;
  title: string;
  relevance: number;
};

type CustomError = {
  message: string;
  code?: number;
};

export const lessonRouter = router({
  retrieve: protectedProcedure
    .input(
      z.object({
        q: z.string(),
      }),
    )
    .output(z.any()) // FIXME: Define the output type using zod
    .query(async ({ ctx, input }) => {
      return new Lessons(ctx.prisma).retrieve(input.q);
    }),
  searchByTranscript: protectedProcedure
    .input(
      z.object({
        q: z.string(),
        keyStage: z
          .string({
            description:
              "Key stage to filter by, e.g. 'Key Stage 2' - note that casing is important here",
          })
          .optional(), // TODO constrain this once we use db types again
        subject: z.string().optional(), // TODO constrain this once we use db types again
      }),
    )
    .output(z.array(LessonWithSnippets))
    .query(async ({ ctx, input }) => {
      // FIXME make this a slug based search
      const foundLessons = await new Lessons(ctx.prisma).searchByTranscript(
        input.q,
        input.keyStage,
        input.subject,
        5,
      );
      return foundLessons as LessonWithSnippets[];
    }),
  searchByTextSimilarity: protectedProcedure
    .input(
      z.object({
        q: z.string(),
      }),
    )
    .output(
      z.array(
        z.object({
          slug: z.string(),
          title: z.string(),
          description: z.string(),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const result: SimilarityResult[] = await ctx.prisma
        .$queryRaw`SELECT * from (SELECT id, title, SIMILARITY(title, ${input.q}) as relevance FROM lessons) as a order by a.relevance desc limit 20`;
      const res = await ctx.prisma.lesson.findMany({
        select: {
          title: true,
          slug: true,
          content: true,
        },
        where: { id: { in: result.map((r) => r.id) } },
      });

      if (!res) {
        throw new TRPCError({
          message: "No lessons found",
          code: "NOT_FOUND",
        });
      }

      type Content = {
        lessonDescription: string;
        // plus a lot more, but we don't need it
      };

      return res.map(({ slug, title, content }) => {
        content = content as Content;
        const description = (content?.lessonDescription ?? "") as string;
        return {
          slug,
          title,
          description,
        };
      });
    }),
  get: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .output(z.any()) // FIXME this model doesn't seem to have a proper type associated
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.lesson.findUnique({
        where: { slug: input.slug },
        include: { summaries: true },
      });

      if (!res) {
        throw new TRPCError({
          message: "Lesson not found",
          code: "NOT_FOUND",
        });
      }

      return removeProperty(res, "id");
    }),
  summary: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .output(
      z.object({
        content: z.string().nullable(),
        topics: z.array(z.string()),
        learningObjectives: z.array(z.string()),
        concepts: z.array(z.string()),
        keywords: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.lesson.findUnique({
        where: { slug: input.slug },
        select: {
          summaries: {
            select: {
              content: true,
              topics: true,
              learningObjectives: true,
              concepts: true,
              keywords: true,
            },
          },
        },
      });

      if (!res?.summaries?.[0]) {
        throw new TRPCError({
          message: "Lesson not found",
          code: "NOT_FOUND",
        });
      }

      return res.summaries[0];
    }),
  summarise: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.object({ error: z.any(), summary: z.any() })) // FIXME: Define the output type using zod
    .mutation(async ({ ctx, input }) => {
      let error: CustomError | null = null;
      let summary: LessonSummary | null = null;
      try {
        summary = await ctx.prisma.lessonSummary.create({
          data: { lessonId: input.id },
        });
        inngest.send({
          name: "app/lesson.summarise",
          data: { lessonId: input.id, lessonSummaryId: summary.id },
        });
      } catch (e) {
        error = { message: (e as Error).message, code: 400 };
      }
      return { error, summary };
    }),

  getOriginalTranscript: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .output(
      z.object({
        transcript: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { slug: input.slug },
      });
      if (!lesson) {
        throw new TRPCError({
          message: "Lesson not found",
          code: "NOT_FOUND",
        });
      }
      const transcript = await ctx.prisma.transcript.findFirst({
        where: { lessonId: lesson.id, variant: "ORIGINAL" },
        cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
      });
      if (!transcript?.content) {
        throw new TRPCError({
          message: "Transcript not found",
          code: "NOT_FOUND",
        });
      }

      const content = transcript.content as TranscriptResult;

      return {
        transcript: content.raw,
      };
    }),
  createOriginalTranscript: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.object({ error: z.any(), transcript: z.any() })) // FIXME: Define the output type using zod
    .mutation(async ({ ctx, input }) => {
      let error: CustomError | null = null;
      let transcript: Transcript | null = null;
      try {
        transcript = await new Lessons(ctx.prisma).createOriginalTranscript(
          input.id,
        );
      } catch (e) {
        error = { message: (e as Error).message, code: 400 };
      }
      return { error, transcript };
    }),
  createQuizStructure: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.object({ error: z.any(), success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      let error: CustomError | null = null;
      let success: boolean = false;
      try {
        await new Lessons(ctx.prisma).createQuizStructure(input.id);
        success = true;
      } catch (e) {
        error = { message: (e as Error).message, code: 400 };
      }
      return { error, success };
    }),

  getQuizStructure: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .output(
      z.array(
        z.object({
          question: z.string(),
          answers: z.array(
            z.object({
              answer: z.string(),
              distractor: z.boolean({
                description: "Whether this answer is incorrect or not",
              }),
            }),
          ),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.prisma.lesson.findUnique({
        where: { slug: input.slug },
        select: { id: true },
      });

      if (!lesson) {
        throw new TRPCError({
          message: "Lesson not found",
          code: "NOT_FOUND",
        });
      }
      return ctx.prisma.quizQuestion.findMany({
        where: { lessonId: lesson.id },
        include: { answers: true },
      });
    }),
});
