/*
 *  NOTE:
 *  This script currently recrates the Rag steps used on the front end, meaning if they are updated they will not cause a fair comparison.
 *  If using this script and this comment/ the Rag steps remain ensure that the Rag steps are updated to match the front end.
 *
 */
import { prisma } from "@oakai/db";
import PQueue from "p-queue-compat";
import { uniq } from "remeda";
import z from "zod";

import { LessonSummaries, Lessons, Prompts, Snippets } from "../models";

const queue = new PQueue({ concurrency: 10 });
const resultsSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
});

type Question = {
  quizQuestionId: string;
  subject: { title: string };
  keyStage: { title: string };
  quizQuestion: {
    question: string;
    lesson: { title: string };
    answers: { answer: string; distractor: boolean }[];
    id: string;
  };
  id: string;
};

type ComparativeJudgement = {
  questionForJudgementId: string;
  optionAId: string;
  optionBId: string;
};

const processingMap = new Map<string, boolean>();

const promptId = "clqb5ms9v0001luubduiibyzk";
const promptIdentifier = "generate-answers-and-distractors-rag";

async function askAiQuestionAndWriteToDatabase(question: Question) {
  const appId = "quiz-generator";

  const lockKey = `${question.id}_${promptIdentifier}`;
  console.log("lockKey", lockKey);

  if (processingMap.has(lockKey) && processingMap.get(lockKey) === true) {
    console.log(
      "AI_QUESTION processing is already in progress. Skipping duplicate.",
    );
    return;
  }

  processingMap.set(lockKey, true);

  try {
    const existingEntry =
      await prisma.answersAndDistractorsForJudgement.findFirst({
        where: {
          quizQuestionId: question.quizQuestionId,
          isOakQuestion: false,
          promptId: promptId,
        },
      });

    if (!existingEntry) {
      const subject = question.subject.title;
      const keyStage = question.keyStage.title;
      const lessonTitle = question.quizQuestion?.lesson?.title;
      const extraContext = `${lessonTitle} : ${question.quizQuestion.question}. Other questions include: None`;
      console.log("extraContext", extraContext);
      const addKnowledge = extraContext;
      const addTranscript = extraContext;
      const factQuestion = `${lessonTitle}: ${question.quizQuestion.question}`;
      let fact = "None";
      if (factQuestion) {
        const factResult = await new Snippets(prisma).answer({
          question: factQuestion,
          keyStage: (keyStage as string | undefined) ?? undefined,
          subject: (subject as string | undefined) ?? undefined,
        });
        if (factResult) {
          fact = factResult;
        }
      }
      console.log("fact", fact);
      let knowledge = "None";
      if (addKnowledge) {
        const lessonSummaries = await new LessonSummaries(prisma).search(
          addKnowledge,
          (keyStage as string | undefined) ?? undefined,
          (subject as string | undefined) ?? undefined,
          10,
        );

        if (lessonSummaries) {
          knowledge = uniq(
            lessonSummaries
              .map((l) => l.topics)
              .flat()
              .filter((t) => t.length < 40),
          ).join(", ");
        }
      }
      console.log("knowledge", knowledge);

      let transcript = "None";
      if (addTranscript) {
        const lessonsWithSnippets = await new Lessons(
          prisma,
        ).searchByTranscript(
          addTranscript,
          (keyStage as string | undefined) ?? undefined,
          (subject as string | undefined) ?? undefined,
          10,
        );

        if (lessonsWithSnippets) {
          transcript = lessonsWithSnippets
            .map((l) => l.snippets.map((s) => s.content).join("\n"))
            .flat()
            .join("\n");
        }
      }
      console.log(
        "transcript",
        transcript !== "None" ? "Transcript has worked" : "None",
      );

      const promptInputs = {
        subject: subject,
        topic: lessonTitle,
        ageRange: getAgesFromKeyStage(keyStage),
        numberOfDistractors: 3,
        numberOfCorrectAnswers: 1,
        question: question.quizQuestion.question,
        keyStage: keyStage,
        knowledge: knowledge,
        fact: fact,
        transcript: transcript,
        otherQuestions: "None",
      };

      console.log("Running: ask open ai ");
      // // ************** DO AI **************

      const prompts = new Prompts(prisma, undefined);
      const prompt = await prompts.get(promptId, appId);
      let promptBody: string;
      let completion;
      let completionResults;

      try {
        if (prompt) {
          promptBody = await prompts.formatPrompt(
            prompt.template,
            promptInputs,
          );

          completion = await prompts.requestChatCompletion(promptBody);
          completionResults = resultsSchema.parse(completion.result);

          console.log("completion", completionResults);
        }
      } catch (err) {
        console.log(
          err,
          "Error formatting or saving prompt template: %s",
          err instanceof Error ? err.message : err,
        );
      }

      console.log("Running: write to db");
      // // ************** Write to db **************

      const questionId = question.quizQuestion.id;
      const answersAndDistractors = {
        answers: completionResults?.answers.map((answer) => ({
          value: answer,
        })),
        distractors: completionResults?.distractors.map((distractor) => ({
          value: distractor,
        })),
      };

      console.log("ai answers and distractors", answersAndDistractors);

      await prisma.answersAndDistractorsForJudgement.create({
        data: {
          quizQuestionId: questionId,
          answerAndDistractor: answersAndDistractors,
          isOakQuestion: false,
          promptId: promptId,
        },
      });
    } else {
      console.log("Duplicate found for AI_QUESTION. Skipping processing.");
    }
  } finally {
    processingMap.delete(lockKey);
  }
}

async function getOakDataForQuestionAndWriteToDatabase(question: Question) {
  const existingEntry =
    await prisma.answersAndDistractorsForJudgement.findFirst({
      where: {
        quizQuestionId: question.quizQuestionId,
        isOakQuestion: true,
      },
    });

  if (!existingEntry) {
    const answersAndDistractors = restructureAnswers(question);
    const restructuredAnswers = {
      ...question,
      answersAndDistractors,
    };

    console.log("oak answers", restructuredAnswers.answersAndDistractors);

    await prisma.answersAndDistractorsForJudgement.create({
      data: {
        quizQuestionId: restructuredAnswers.quizQuestionId,
        answerAndDistractor: restructuredAnswers.answersAndDistractors,
        isOakQuestion: true,
      },
    });
  } else {
    console.log("Duplicate found for OAK_QUESTION. Skipping processing.");
  }
}

async function writeToComparativeJudgementTable() {
  console.log("Starting writeToComparativeJudgementTable");
  await prisma.comparativeJudgement.deleteMany({});
  const result: {
    questions_for_judgement_id: string;
    oak: string;
    ai: string;
  }[] = await prisma.$queryRaw`
  WITH pair_ai_and_oak_questions AS (
	SELECT
		questions_for_judgement.id AS questions_for_judgement_id,
		answers_and_distractors_for_judgement.id AS answers_id,
		is_oak_question
	FROM
		questions_for_judgement
		JOIN answers_and_distractors_for_judgement ON questions_for_judgement.quiz_question_id = answers_and_distractors_for_judgement.quiz_question_id
)
  SELECT
	questions_for_judgement_id,
	max(
		CASE WHEN is_oak_question = false THEN
			answers_id
		END) AS oak,
	max(
		CASE WHEN is_oak_question = true THEN
			answers_id
		END) AS ai
  FROM
	pair_ai_and_oak_questions
  GROUP BY
	questions_for_judgement_id;
  `;
  console.log("result", result);
  const mappedResult = result.map((result) => {
    if (result.oak && result.ai) {
      return {
        questionForJudgementId: result.questions_for_judgement_id,
        optionAId: result.oak,
        optionBId: result.ai,
      };
    }
    console.log("There is not a matching pair for this question");
    return null;
  });

  const notNullMappedResult = mappedResult.filter(
    (result) => result !== null,
  ) as ComparativeJudgement[];
  if (notNullMappedResult) {
    await prisma.comparativeJudgement.createMany({
      //  Get id if the questionForJudgementId matches
      data: notNullMappedResult,
    });
  }
}

const main = async () => {
  try {
    console.log("Starting");
    // ************** Get data **************
    // await prisma.answersAndDistractorsForJudgement.deleteMany({});
    // await prisma.comparativeJudgement.deleteMany({});
    const questions = await prisma.questionsForJudgement.findMany({
      include: {
        quizQuestion: {
          include: {
            lesson: true,
            answers: true,
          },
        },
        subject: true,
        keyStage: true,
      },
      where: {
        quizQuestion: {
          lesson: {
            isNewLesson: true,

            subject: {
              slug: {
                in: ["english", "history", "geography", "science"],
                notIn: [
                  "german",
                  "spanish",
                  "maths",
                  "french",
                  "latin",
                  "english",
                ],
              },
            },
          },
        },
      },
    });

    console.log("Number of questions being processed", questions.length);

    for (const question of questions) {
      queue.add(() => {
        // Transforms oak data into the JSON format used in the answers and distractors for comparatative judgement table
        return getOakDataForQuestionAndWriteToDatabase(question as Question);
      });
      queue.add(() => {
        //   // Runs the AI on the question and writes to the answers and distractors for comparatative judgement table
        return askAiQuestionAndWriteToDatabase(question as Question);
      });
    }
    await queue.onIdle();
    // Finds pairs and writes to comparative judgement table
    await writeToComparativeJudgementTable();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    console.log("Done");
    // await prisma.$disconnect();
  }
};

main()
  .then(async () => {
    // await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    // await prisma.$disconnect();
    process.exit(1);
  });

export {};

function getAgesFromKeyStage(keyStage: string | undefined) {
  if (keyStage === "Early Years Foundation Stage") return "3-5 years old";
  if (keyStage === "Key Stage 1") return "5-7 years old";
  if (keyStage === "Key Stage 2") return "7-11 years old";
  if (keyStage === "Key Stage 3") return "11-14 years old";
  if (keyStage === "Key Stage 4") return "14-16 years old";
}

function restructureAnswers(question: {
  quizQuestion: {
    answers: { answer: string; distractor: boolean }[];
  };
}) {
  const answerAndDistractor: {
    answers: { value: string }[];
    distractors: { value: string }[];
  } = {
    answers: [],
    distractors: [],
  };

  for (const answer of question.quizQuestion.answers) {
    if (answer.distractor === false) {
      answerAndDistractor.distractors.push({ value: answer.answer });
    } else {
      answerAndDistractor.answers.push({ value: answer.answer });
    }
  }
  return answerAndDistractor;
}
