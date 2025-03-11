import type {
  KeyStageName,
  SubjectName,
  subjectsAndKeyStages,
} from "@oakai/core";
import { sendJudgementFeedbackEmail } from "@oakai/core/src/utils/sendJudgementFeedbackEmail";
import { aiLogger, structuredLogger as logger } from "@oakai/logger";

import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const log = aiLogger("judgements");

interface QuestionForJudgement {
  questionForJudgement: {
    keyStage: {
      title: KeyStageName;
    };
    subject: {
      title: SubjectName;
    };
  };
}

export const judgementRouter = router({
  getAvailableKeyStageAndSubjectPairingsFromComparativeJudgement:
    protectedProcedure.input(z.object({})).query(async ({ ctx }) => {
      const keyStagesAndSubjects =
        await ctx.prisma.comparativeJudgement.findMany({
          select: {
            questionForJudgement: {
              select: {
                keyStage: {
                  select: {
                    title: true,
                  },
                },
                subject: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        });

      return reshapeSubjectAndKeyStageData(
        keyStagesAndSubjects as QuestionForJudgement[],
      );
    }),
  getShareableComparisonFromId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const judgement = await ctx.prisma.comparativeJudgement.findFirst({
        where: {
          id: id,
        },
        include: {
          optionA: {
            include: {
              prompt: true,
            },
          },
          optionB: true,
          questionForJudgement: {
            include: {
              keyStage: true,
              subject: true,
              quizQuestion: {
                include: {
                  lesson: true,
                },
              },
            },
          },
        },
      });
      return judgement;
    }),
  getComparisonBySubjectKeyStagePair: protectedProcedure
    .input(
      z.object({
        keyStage: z.string(),
        subject: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { keyStage, subject } = input;
      const userId = ctx.auth.userId;
      if (typeof userId === "string") {
        const userComparativeJudgements =
          await ctx.prisma.comparativeJudgementResult.findMany({
            where: {
              userId: userId,
            },
          });
        const unjudgedQuestionsByUser =
          await ctx.prisma.comparativeJudgement.findFirst({
            where: {
              id: {
                notIn: userComparativeJudgements.map((judgement) => {
                  return judgement.judgementId;
                }),
              },
              questionForJudgement: {
                keyStage: {
                  title: keyStage,
                },
                subject: {
                  title: subject,
                },
              },
            },
            include: {
              optionA: true,
              optionB: true,
              questionForJudgement: {
                include: {
                  keyStage: true,
                  subject: true,
                  quizQuestion: {
                    include: {
                      lesson: true,
                    },
                  },
                },
              },
            },
          });

        return unjudgedQuestionsByUser;
      }
    }),
  selectBetterQuestionSet: protectedProcedure
    .input(
      z.object({
        judgementId: z.string(),
        winnerId: z.string(),
        reason: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { judgementId, winnerId, reason } = input;

      try {
        if (typeof ctx.auth.userId === "string")
          await ctx.prisma.comparativeJudgementResult.create({
            data: {
              userId: ctx.auth.userId,
              judgementId: judgementId,
              winnerId: winnerId,
              reasonForChoosingWinner: reason,
            },
          });
      } catch (err) {
        logger.error("User tried to vote for a question", err);
      }

      return true;
    }),
  flagOrSkipQuestion: protectedProcedure
    .input(
      z.object({
        judgementId: z.string().nullable(),
        flaggedOrSkipped: z
          .union([z.literal("FLAGGED"), z.literal("SKIPPED")])
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { judgementId, flaggedOrSkipped } = input;
      try {
        if (judgementId)
          await ctx.prisma.comparativeJudgementResult.create({
            data: {
              userId: ctx.auth.userId ? ctx.auth.userId : "",
              judgementId: judgementId,
              flaggedOrSkipped: flaggedOrSkipped,
              winnerId: null,
            },
          });
      } catch (err) {
        logger.error("User tried to flag or skip a question", err);
      }
      return true;
    }),
  flag: protectedProcedure
    .input(
      z.object({
        judgementId: z.string(),
        flaggedAnswerAndDistractorId: z.string(),
        user: z.object({
          email: z.string(),
        }),
        feedback: z.object({
          typedFeedback: z.string(),
          contentIsInappropriate: z.boolean(),
          contentIsFactuallyIncorrect: z.boolean(),
          contentIsNotHelpful: z.boolean(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { feedback, user, judgementId, flaggedAnswerAndDistractorId } =
        input;
      // We currently have some inconsistencies with zod generated
      // types in which value is coming back as potentially undefined
      // so cast it here for now

      await sendJudgementFeedbackEmail({
        user,
        flaggedItem: `Judgement ID: ${judgementId} - Answer and Distractor ID: ${flaggedAnswerAndDistractorId}`,
        feedback,
      });

      logger.debug(
        "Giving feedback for generation %s",
        flaggedAnswerAndDistractorId,
      );

      try {
        if (typeof ctx.auth.userId === "string") {
          await ctx.prisma.comparativeJudgementResult.create({
            data: {
              userId: ctx.auth.userId,
              judgementId: judgementId,
              flaggedOrSkipped: "FLAGGED",
              winnerId: null,
            },
          });
        }
        await ctx.prisma.comparativeJudgementFlag.create({
          data: {
            flaggedJudgementId: judgementId,
            flaggedAnswerAndDistractorId: flaggedAnswerAndDistractorId,
            feedbackMessage: feedback.typedFeedback,
            feedbackReasons: {
              isInappropriate: feedback.contentIsInappropriate,
              isIncorrect: feedback.contentIsFactuallyIncorrect,
              isUnhelpful: feedback.contentIsNotHelpful,
            },
          },
        });
        log.info("Flagged in comparative judgement successfully");
      } catch (err) {
        logger.error("User tried to flag or skip a question", err);
        return err;
      }
      return true;
    }),
});

export type AnswerAndDistractorType = {
  answers: { value: string }[];
  distractors: { value: string }[];
};

function reshapeSubjectAndKeyStageData(data: QuestionForJudgement[]) {
  const uniqueSubjects = new Set<SubjectName>();
  const uniqueStages = new Set<KeyStageName>();
  const reshaped: typeof subjectsAndKeyStages = {
    allSubjects: [],
    allStages: [],
    byKeyStage: {
      "Key Stage 1": { subjects: [] },
      "Key Stage 2": { subjects: [] },
      "Key Stage 3": { subjects: [] },
      "Key Stage 4": { subjects: [] },
    },
  };

  data.forEach((item) => {
    const keyStage = item.questionForJudgement.keyStage.title;
    const subject = item.questionForJudgement.subject.title;

    if (reshaped.byKeyStage[keyStage]) {
      if (!reshaped.byKeyStage[keyStage].subjects.includes(subject)) {
        reshaped.byKeyStage[keyStage].subjects.push(subject);
      }
      uniqueSubjects.add(subject);
      uniqueStages.add(keyStage);
    }
  });

  reshaped.allSubjects = Array.from(uniqueSubjects);
  reshaped.allStages = Array.from(uniqueStages);

  return reshaped;
}
