import type { GenerationPart } from "@oakai/core/src/types";
import { aiLogger } from "@oakai/logger";

import { getAgesFromKeyStage } from "@/utils/getAgesFromKeyStage";

import { extraQuizPromptInfo } from "./extraQuizPromptInfo";
import type { QuizAppState, QuizAppStateQuestion } from "./state/types";

const logger = aiLogger("quiz");

export type RequestionGenerationInputs = {
  lastGenerationId: string | null;
  sessionId: string;
  factQuestion: string;
  addKnowledge: string;
  addTranscript: string;
  promptInputs: {
    sessionId: string;
    question: string;
    otherQuestions: string;
    subject: string;
    keyStage: string;
    ageRange?: string;
    topic?: string;
    numberOfCorrectAnswers: number;
    numberOfDistractors: number;
    answers: string[];
    distractors: string[];
  };
};

export type QuizRequestGenerationProps = {
  state: QuizAppState;
  questionRow: QuizAppStateQuestion;
  lastGeneration: GenerationPart<string> | undefined;
  requestGeneration: (
    requestionGenInputs: RequestionGenerationInputs,
  ) => Promise<void>;
};

export async function quizRequestGeneration({
  state,
  questionRow,
  requestGeneration,
  lastGeneration,
}: QuizRequestGenerationProps) {
  const { subject, sessionId, keyStage, topic } = state;
  if (!sessionId) {
    return;
  }
  const { otherQuestions, extraContext } = extraQuizPromptInfo({
    state,
    questionRow,
  });
  await requestGeneration({
    lastGenerationId: lastGeneration?.lastGenerationId ?? null,
    sessionId,
    factQuestion: `${topic}: ${questionRow.question.value}`,
    addKnowledge: extraContext,
    addTranscript: extraContext,
    promptInputs: {
      sessionId,
      question: questionRow.question.value,
      otherQuestions,
      subject,
      keyStage,
      ageRange: getAgesFromKeyStage(keyStage),
      topic,
      numberOfCorrectAnswers: questionRow.numberOfAnswers,
      numberOfDistractors: 3 - questionRow.numberOfAnswers,
      answers: questionRow.answers.map((answer) => answer.value),
      distractors: questionRow.distractors.map(
        (distractor) => distractor.value,
      ),
    },
  }).catch((e) => {
    logger.error(e);
  });
}
