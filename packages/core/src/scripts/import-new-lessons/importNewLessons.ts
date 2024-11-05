import type { Quiz } from "@oakai/db";
import { prisma } from "@oakai/db";
import { GraphQLClient, gql } from "graphql-request";

const batchSize = parseInt(process.env.LESSON_QUERY_BATCH_SIZE || "");
const LESSON_QUERY_BATCH_SIZE = Number.isInteger(batchSize) ? batchSize : 10;
const QUERY_SLEEP_MS = 1000; // Delay between API calls to avoid rate limiting/hammering the db
const MAX_LESSONS = Infinity; // Set a smaller limit for testing when we don't want all ~10k

/*
 *
 * You must define keystage and subject slug before running
 *
 */
const keyStageSlug = "ks1";
const subjectSlug = "science";

type Quiz = {
  hint: string;
  active: boolean;
  answers: {
    "multiple-choice": [
      {
        answer: {
          text: string;
          type: string;
        }[];
        answer_is_correct: boolean;
      },
    ];
  };
  feedback: string;
  questionId: number;
  questionUid: string;
  questionStem: [
    {
      text: string;
      type: string;
    },
  ];
  questionType: string;
};

type TypedLesson = {
  lessonSlug: string;
  lessonTitle: string;
  keyStageTitle: string;
  keyStageSlug: string;
  subjectSlug: string;
  starterQuiz: Quiz[];
  exitQuiz: Quiz[];
};

type Lesson = {
  lessonSlug: string;
  lessonTitle: string;
  keyStageTitle: string;
  keyStageSlug: string;
  subjectSlug: string;
  starterQuiz: Quiz[];
  exitQuiz: Quiz[];
};

const graphqlClient = new GraphQLClient(
  "https://hasura.thenational.academy/v1/graphql",
  {
    headers: {
      "x-oak-auth-key": process.env.OAK_GRAPHQL_SECRET as string,
      "x-oak-auth-type": "oak-admin",
    },
  },
);

const main = async () => {
  try {
    console.log("Starting");

    let offset = 0;
    let done = false;

    while (!done) {
      // Define your GraphQL query
      const query = gql`
        query lessonOverview(
          $batchSize: Int!
          $offset: Int!
          $keyStageSlug: String!
          $subjectSlug: String!
        ) {
          lessons: published_mv_lesson_overview_3_0_2(
            where: {
              keyStageSlug: { _eq: $keyStageSlug }
              subjectSlug: { _eq: $subjectSlug }
            }
            limit: $batchSize
            offset: $offset
          ) {
            lessonSlug
            lessonTitle
            programmeSlug
            unitSlug
            unitTitle
            keyStageSlug
            keyStageTitle
            subjectSlug
            subjectTitle
            examBoardTitle
            tierTitle
            misconceptionsAndCommonMistakes
            lessonEquipmentAndResources
            teacherTips
            keyLearningPoints
            pupilLessonOutcome
            lessonKeywords
            copyrightContent
            contentGuidance
            additionalMaterialUrl
            supervisionLevel
            worksheetUrl
            presentationUrl
            videoMuxPlaybackId
            videoWithSignLanguageMuxPlaybackId
            transcriptSentences
            starterQuiz
            exitQuiz
            yearTitle
            hasDownloadableResources
            videoTitle
          }
        }
      `;

      // Variables for the GraphQL qu ery
      const variables = {
        keyStageSlug,
        subjectSlug,
        batchSize: 1,
        offset,
      };

      // Make the GraphQL request

      const lessonData: { lessons: Lesson[] } = await graphqlClient.request<{
        lessons: Lesson[];
      }>(query, variables);

      console.log("lessonData", lessonData.lessons.length);
      // Map through lessons and add them to the Prisma database

      console.log("Writing to Prisma");

      await Promise.all(
        lessonData.lessons.map(async (lesson: Lesson) => {
          const lessonTyped: TypedLesson = lesson;
          if (
            lessonTyped.starterQuiz.some(
              (question) => question.questionType === "multiple-choice",
            )
          ) {
            lessonTyped.starterQuiz = lessonTyped.starterQuiz.filter(
              (question) => question.questionType === "multiple-choice",
            );
          }
          if (
            lessonTyped.exitQuiz.some(
              (question) => question.questionType === "multiple-choice",
            )
          ) {
            lessonTyped.exitQuiz = lessonTyped.exitQuiz.filter(
              (question) => question.questionType === "multiple-choice",
            );
          }

          const createOrUpdateLesson = {
            title: lessonTyped.lessonTitle,
            slug: lessonTyped.lessonSlug,
            keyStageName: lessonTyped.keyStageTitle,
            keyStage: {
              connect: {
                slug: kebabCaseKeyStage(keyStageSlug),
              },
            },
            subject: {
              connect: {
                slug: subjectSlug,
              },
            },

            newLessonContent: {
              ...lessonTyped,
            },
            captions: {},
            isNewLesson: true,
          };
          /// Create Lesson
          const createdLesson = await prisma.lesson.upsert({
            where: {
              slug: lessonTyped.lessonSlug,
            },
            create: {
              ...createOrUpdateLesson,
            },
            update: {
              ...createOrUpdateLesson,
            },
          });
          /// Create Quiz questions
          lesson?.starterQuiz?.map(async (quiz: Quiz) => {
            await addQuizQuestion(quiz, lessonTyped);
            await addQuizAnswer(quiz, lessonTyped, createdLesson.id);
          });

          lesson?.exitQuiz?.map(async (quiz: Quiz) => {
            await addQuizQuestion(quiz, lessonTyped);
            await addQuizAnswer(quiz, lessonTyped, createdLesson.id);
          });
        }),
      );

      if (
        lessonData.lessons.length === 0 ||
        offset >= MAX_LESSONS - LESSON_QUERY_BATCH_SIZE
      ) {
        done = true;
      }

      offset += LESSON_QUERY_BATCH_SIZE;
      console.log("offset", offset);
      // Don't rate limit ourselves
      await sleep(QUERY_SLEEP_MS);
    }
  } catch (e) {
    console.error(e);

    console.log("something went wrong");
    console.log("error", e);
    process.exit(1);
  } finally {
    console.log("Done");
    await prisma.$disconnect();
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function addQuizQuestion(quiz: Quiz, lessonTyped: TypedLesson) {
  await prisma.quizQuestion.upsert({
    where: {
      originalQuestionId: quiz.questionId,
    },
    create: {
      originalQuestionId: quiz.questionId,
      question: quiz.questionStem[0].text,
      lesson: {
        connect: {
          slug: lessonTyped.lessonSlug,
        },
      },
    },
    update: {
      originalQuestionId: quiz.questionId,
      question: quiz.questionStem[0].text,
      lesson: {
        connect: {
          slug: lessonTyped.lessonSlug,
        },
      },
    },
  });
  console.log("question added");
}

function kebabCaseKeyStage(keyStage: string) {
  if (keyStage === "ks1") {
    return "key-stage-1";
  }
  if (keyStage === "ks2") {
    return "key-stage-2";
  }
  if (keyStage === "ks3") {
    return "key-stage-3";
  }
  if (keyStage === "ks4") {
    return "key-stage-4";
  }
  return "";
}

async function addQuizAnswer(
  quiz: Quiz,
  lessonTyped: TypedLesson,
  lessonId: string,
) {
  await Promise.all(
    quiz.answers["multiple-choice"].map(async (a) => {
      await Promise.all(
        a.answer.map(async (answer) => {
          const questionFromOriginalId = await prisma.quizQuestion.findFirst({
            where: {
              originalQuestionId: quiz.questionId,
            },
          });

          if (!questionFromOriginalId) {
            throw new Error("Question not found in the database");
          }

          const questionId = questionFromOriginalId.id;

          await prisma.quizAnswer
            .upsert({
              where: {
                lessonId_questionId_answer: {
                  questionId,
                  answer: answer.text,
                  lessonId: lessonId,
                },
              },
              create: {
                distractor: a.answer_is_correct,
                answer: answer.text,
                lesson: {
                  connect: {
                    slug: lessonTyped.lessonSlug,
                  },
                },
                question: {
                  connect: {
                    originalQuestionId: quiz.questionId,
                  },
                },
              },
              update: {
                distractor: a.answer_is_correct,
                answer: answer.text,
                lesson: {
                  connect: {
                    slug: lessonTyped.lessonSlug,
                  },
                },
                question: {
                  connect: {
                    originalQuestionId: quiz.questionId,
                  },
                },
              },
            })
            .catch((e) => {
              console.log("error", e);
            });
        }),
      );
    }),
  );

  console.log("answers added");
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export {};
