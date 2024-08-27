import { GenerationPart } from "@oakai/core/src/types";

import { getAgesFromKeyStage } from "@/utils/getAgesFromKeyStage";

import { extraQuizPromptInfo } from "./extraQuizPromptInfo";
import { QuizAppState, QuizAppStateQuestion } from "./state/types";

type RequestionGenerationInputs = {
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

type QuizRequestGenerationProps = {
  state: QuizAppState;
  questionRow: QuizAppStateQuestion;
  lastGeneration: GenerationPart<string> | undefined;
  requestGeneration: (requestionGenInputs: RequestionGenerationInputs) => void;
};

export function quizRequestGeneration({
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
  requestGeneration({
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
  });
}
