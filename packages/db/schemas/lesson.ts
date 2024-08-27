import { z } from "zod";

import { Programme } from "./programme";
import { Quiz } from "./quiz";
import { Unit } from "./unit";
import { Video } from "./video";

export const ZLesson = z.object({
  expired: z.boolean(),
  id: z.number(),
  isSensitive: z.boolean(),
  lessonDescription: z.string(),
  hasCopyrightMaterial: z.boolean(),
  slug: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  pupilsWillLearn: z.string().nullable().optional(),
  contentGuidance: z.string().nullable().optional(),
  guidanceDetails: z.string().nullable().optional(),
  supervisionLevel: z.string().nullable().optional(),
  quizzes: z.array(Quiz),
  slidesUrl: z.string().nullable().optional(),
  video: Video,
  unitLessons: z.array(
    z.object({
      id: z.number(),
      positionInUnit: z.number(),
      introQuizUrl: z.string().nullable().optional(),
      unit: Unit,
    }),
  ),
  unit: z.object({
    id: z.number(),
    slug: z.string(),
    numberOfLessons: z.number(),
    isSensitive: z.boolean(),
    unitQuizzes: z.array(z.unknown()).nullish(),
    programmeOfStudyUnits: z.array(
      z.object({
        id: z.number(),
        programme: z.object({
          id: z.number(),
          slug: z.string(),
          title: z.string(),
          subject: z.object({
            id: z.number(),
            slug: z.string(),
            title: z.string(),
          }),
          year: z.object({
            id: z.number(),
            title: z.string(),
            slug: z.string(),
            keyStage: z.object({
              id: z.number(),
              title: z.string(),
              slug: z.string(),
            }),
          }),
        }),
      }),
    ),
    therapyUnits: z.array(z.unknown()).nullish(),
    // unitLessons: z.array(
    //   z.object({
    //     id: z.number(),
    //     positionInUnit: z.number(),
    //     lesson: z.object({
    //       id: z.number(),
    //       slug: z.string(),
    //       title: z.string(),
    //       isSensitive: z.boolean(),
    //     }),
    //   }),
    // ),
    topic: z.object({
      title: z.string(),
      id: z.number(),
      slug: z.string().nullable().optional(),
      topicType: z.object({ title: z.string() }),
    }),
  }),
  programme: Programme.nullable().optional(),
  year: z
    .object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
      keyStage: z.object({
        id: z.number(),
        title: z.string(),
        slug: z.string(),
      }),
    })
    .nullable()
    .optional(),
  subject: z
    .object({
      id: z.number(),
      slug: z.string(),
      title: z.string(),
    })
    .nullable()
    .optional(),
  exitQuiz: Quiz.nullable().optional(),
  exitQuizId: z.string().nullable().optional(),
  exitQuizUrl: z.string().nullable().optional(),
  introQuiz: Quiz.nullable().optional(),
  introQuizId: z.string().nullable().optional(),
  introQuizUrl: z.string().nullable().optional(),
  slidesId: z.string().nullable().optional(),
  activities: z.array(
    z.union([
      z.object({
        displaySequence: z.number(),
        linkSequence: z.number(),
        activityType: z.string(),
        url: z.string(),
        lessonSlug: z.string(),
        quiz: Quiz,
      }),
      z.object({
        displaySequence: z.number(),
        linkSequence: z.number(),
        activityType: z.string(),
        video: Video,
        lessonSlug: z.string(),
        transcript: z.string().nullable(),
      }),
      z.object({
        displaySequence: z.number(),
        activityType: z.string(),
        url: z.string(),
        lessonSlug: z.string(),
      }),
      z.object({
        displaySequence: z.number(),
        activityType: z.string(),
        transcript: z.string().nullable(),
        lessonSlug: z.string(),
      }),
    ]),
  ),
  isSpecialist: z.boolean(),
});

export const LessonPage = z.object({
  props: z.object({
    pageProps: z.object({
      lesson: ZLesson,
    }),
  }),
});

export const ZNewLesson = z
  .object({
    pupilLessonOutcome: z.string().nullable().optional(),
    transcriptSentences: z.string().nullable().optional(),
    lessonTitle: z.string(),
  })
  .passthrough();
