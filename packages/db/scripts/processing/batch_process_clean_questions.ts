import { aiLogger } from "@oakai/logger";

import { prisma } from "../../";

const logger = aiLogger("db");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getQuestionsAndWriteBatch(_skip: number) {
  const questions = await prisma.quizQuestion.findMany({
    include: {
      answers: {
        include: {
          lesson: {
            include: {
              subject: true,
              keyStage: true,
            },
          },
        },
      },
    },
    where: {
      lesson: {
        subjectId: {
          not: undefined,
        },
        keyStageId: {
          not: undefined,
        },
        isNewLesson: true,
        subject: {
          slug: {
            in: ["english"],
            notIn: ["german", "spanish", "maths", "french", "latin"],
          },
        },
      },
    },
  });
  logger.info("questions", questions);
  await prisma.questionsForJudgement.createMany({
    data: questions
      .filter(
        (question) =>
          (question.question &&
            question.question.split(" ").length > 2 &&
            question.answers[0]?.lesson.subject?.id &&
            question.answers[0]?.lesson.subject?.id !== undefined &&
            question.answers[0]?.lesson.subject?.id !== null &&
            question.question.endsWith("?")) ??
          (question.question &&
            question.question.split(" ").length > 2 &&
            question.answers[0]?.lesson.subject?.id &&
            question.answers[0]?.lesson.subject?.id !== undefined &&
            question.answers[0]?.lesson.subject?.id !== null &&
            question.question.endsWith("...")),
      )
      .map((question) => ({
        quizQuestionId: question.id,
        subjectId: question.answers[0]?.lesson.subject?.id as string,
        keyStageId: question.answers[0]?.lesson.keyStage?.id as string,
      })),
  });
}

async function removeQuestionsContainingWords(string: string) {
  const questions = await prisma.questionsForJudgement.findMany({
    include: {
      quizQuestion: true,
    },
  });

  const questionsToRemove = questions.filter((question) =>
    question?.quizQuestion?.question?.includes(string),
  );
  await prisma.questionsForJudgement.deleteMany({
    where: {
      id: {
        in: questionsToRemove.map((question) => question.id),
      },
    },
  });
  logger.info("Removed number of questions", questionsToRemove.length);
}

const main = async () => {
  try {
    // let skip = 0;
    // while (skip < 65000) {
    //   await getQuestionsAndWriteBatch(skip);
    //   skip += 1000;
    // }
    await getQuestionsAndWriteBatch(0);
    await removeQuestionsContainingWords("**not**");
  } catch (e) {
    logger.error(e);
    process.exit(1);
  } finally {
    logger.info("Done");
    await prisma.$disconnect();
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export {};
