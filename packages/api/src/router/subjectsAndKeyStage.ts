import {
  type KeyStageName,
  type SubjectName,
  subjectsAndKeyStages,
} from "@oakai/core";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const allKeyStages = subjectsAndKeyStages.allStages.map(encodeURIComponent) as [
  string,
];
const allSubjects = subjectsAndKeyStages.allSubjects.map(
  encodeURIComponent,
) as [string];

type Quiz = Question[];

interface Question {
  hint: string;
  active: boolean;
  answers: Answers;
  feedback: string;
  questionId: number;
  questionUid: string;
  questionStem: QuestionStem[];
  questionType: string;
}

interface Answers {
  "multiple-choice": MultipleChoice[];
}

interface MultipleChoice {
  answer: Answer[];
  answer_is_correct: boolean;
}

interface Answer {
  text: string;
  type: string;
}

interface QuestionStem {
  text: string;
  type: string;
}

const lessonWithQuestions = z.object({
  title: z.string(),
  slug: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      answers: z.array(
        z.object({ answer: z.string(), distractor: z.boolean() }),
      ),
    }),
  ),
});

type LessonWithQuestions = z.infer<typeof lessonWithQuestions>;

async function getQuestionsForKSAndSubject(
  prisma: PrismaClientWithAccelerate,
  keyStage: KeyStageName | undefined,
  subject: SubjectName | undefined,
): Promise<LessonWithQuestions[]> {
  type getQuestionsForKSAndSubjectWhere = {
    isNewLesson: boolean;
    keyStage?: {
      title: KeyStageName;
    };
    subject?: {
      title: SubjectName;
    };
  };

  const where = {
    isNewLesson: true,
  } as getQuestionsForKSAndSubjectWhere;

  if (keyStage) {
    where.keyStage = {
      title: keyStage,
    };
  }

  if (subject) {
    where.subject = {
      title: subject,
    };
  }

  const res = await prisma.lesson.findMany({
    select: {
      title: true,
      slug: true,
      newLessonContent: true,
    },

    where,
  });

  return res.map((lesson) => {
    const { title, slug } = lesson;

    const newLessonContent = lesson.newLessonContent as unknown as {
      starterQuiz: Quiz;
      exitQuiz: Quiz;
    };

    const quizzes = [newLessonContent?.starterQuiz, newLessonContent?.exitQuiz];

    const questions = quizzes.flatMap((quiz) => {
      return quiz.map((question) => {
        let text = "";
        const stem = question.questionStem;
        if (stem && stem.length > 0 && stem[0]) {
          text = stem[0].text;
        }

        const answers = question.answers["multiple-choice"].map((answer) => {
          let text = "";

          const found = answer.answer.find((_) => _.type === "text");

          if (found) {
            text = found.text;
          }

          return {
            answer: text,
            distractor: !answer.answer_is_correct,
          };
        });

        return {
          question: text,
          answers,
        };
      });
    });

    return {
      title,
      slug,
      questions,
    };
  });
}

export const subjectAndKeyStagesRouter = router({
  getAllSubjects: protectedProcedure.output(z.string().array()).query(() => {
    return subjectsAndKeyStages.allSubjects;
  }),
  searchSubjects: protectedProcedure

    .input(z.object({ q: z.string() }))
    .output(z.string().array())
    .query(({ input }) => {
      const q = input.q.toLowerCase();
      const res = subjectsAndKeyStages.allSubjects.filter((s) =>
        s.toLowerCase().includes(q),
      );
      return res;
    }),
  getAllQuestionsForKeyStageAndSubject: protectedProcedure

    .input(
      z.object({
        keyStage: z.enum(allKeyStages, {
          description:
            "Key stage to filter by, e.g. 'Key Stage 2' - note that casing is important here, and should be escaped",
        }),
        subject: z.enum(allSubjects, {
          description:
            "Subject to search by, e.g. 'Science' - note that casing is important here",
        }),
      }),
    )
    .output(z.array(lessonWithQuestions))
    .query(({ input, ctx }) => {
      const key = decodeURIComponent(input.keyStage) as KeyStageName;
      const subject = decodeURIComponent(input.subject) as SubjectName;

      return getQuestionsForKSAndSubject(ctx.prisma, key, subject);
    }),
  getAllQuestionsForSubject: protectedProcedure
    .input(
      z.object({
        subject: z.string({
          description:
            "Subject to search by, e.g. 'Science' - note that casing is important here",
        }),
      }),
    )
    .output(z.array(lessonWithQuestions))
    .query(({ input, ctx }) => {
      const subject = decodeURIComponent(input.subject) as SubjectName;

      return getQuestionsForKSAndSubject(ctx.prisma, undefined, subject);
    }),
  getAll: protectedProcedure
    .input(z.void()) // required by trpc-openapi
    .output(
      z.object({
        allSubjects: z.string().array(),
        allStages: z.string().array(),
        byKeyStage: z.any(),
      }),
    )
    .query(() => {
      return subjectsAndKeyStages;
    }),
});
