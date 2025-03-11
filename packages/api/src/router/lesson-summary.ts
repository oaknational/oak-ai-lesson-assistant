import { LessonSummaries } from "@oakai/core";

import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

export const lessonSummaryRouter = router({
  search: protectedProcedure
    .input(
      z.object({
        q: z.string(),
        keyStage: z.string().optional(),
        subject: z.string().optional(),
        numberOfResults: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { numberOfResults, subject, keyStage, q } = input;
      const lessonSummaries = new LessonSummaries(ctx.prisma).search(
        q,
        keyStage,
        subject,
        numberOfResults ?? 10,
      );
      return lessonSummaries;
    }),

  searchForRelevantLessons: protectedProcedure
    .input(
      z.object({
        q: z.string(),
        keyStage: z.string().optional(),
        subject: z.string().optional(),
        numberOfResults: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { numberOfResults, subject, keyStage, q } = input;
      const lessonSummaries = await new LessonSummaries(ctx.prisma).search(
        q,
        keyStage,
        subject,
        numberOfResults ?? 10,
      );

      const contentFromLessonTable = await ctx.prisma.lesson.findMany({
        where: {
          id: {
            in: lessonSummaries.map((ls) => ls.lessonId),
          },
        },
      });

      const lessonSummariesWithContent = lessonSummaries.map((ls) => {
        const lesson = contentFromLessonTable.find((l) => l.id === ls.lessonId);
        const parsedLessonContent = lessonContentSchema.parse(lesson?.content);
        return {
          ...ls,
          unit: parsedLessonContent.unit,
        };
      });

      return lessonSummariesWithContent;
    }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.lessonSummary.findUnique({
        where: { id: input.id },
      });
    }),
});

const lessonContentSchema = z.object({
  unit: z.object({
    slug: z.string(),
  }),
});
