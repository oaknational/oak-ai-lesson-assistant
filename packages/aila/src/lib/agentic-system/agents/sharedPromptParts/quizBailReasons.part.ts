import { createPromptPartMessageFn } from "./_createPromptPart";

const QUIZ_SECTIONS = ["starterQuiz", "exitQuiz"] as const;

type QuizSectionKey = (typeof QUIZ_SECTIONS)[number];

interface BailReason {
  section: QuizSectionKey;
  reason: string;
}

function extractBailReasons(doc: Record<string, unknown>): BailReason[] {
  const results: BailReason[] = [];
  for (const section of QUIZ_SECTIONS) {
    const quiz = doc[section];
    if (
      quiz &&
      typeof quiz === "object" &&
      "bailReason" in quiz &&
      typeof quiz.bailReason === "string"
    ) {
      results.push({ section, reason: quiz.bailReason });
    }
  }
  return results;
}

function formatBailReasons(reasons: BailReason[]): string {
  return reasons
    .map(
      ({ section, reason }) =>
        `- ${section === "starterQuiz" ? "Starter quiz" : "Exit quiz"}: ${reason}`,
    )
    .join("\n");
}

export function getQuizBailReasons(doc: Record<string, unknown>): BailReason[] {
  return extractBailReasons(doc);
}

export const quizBailReasonsPromptPart = createPromptPartMessageFn<
  BailReason[]
>({
  heading: "QUIZ GENERATION FAILURES",
  description: () =>
    "The following quiz sections could NOT be generated. You MUST mention these failures to the user and explain why the quiz could not be created. Do NOT list these sections as successfully generated.",
  contentToString: formatBailReasons,
});
