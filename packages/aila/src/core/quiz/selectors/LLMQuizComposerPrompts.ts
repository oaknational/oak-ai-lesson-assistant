import dedent from "dedent";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import { quizEffectivenessPrompt } from "../QuestionAssesmentPrompt";
import type { QuizQuestionPool, QuizQuestionWithRawJson } from "../interfaces";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";

// Schema for the LLM's composition response
export const CompositionResponseSchema = z.object({
  overallStrategy: z
    .string()
    .describe(
      "Brief explanation of how the selected questions work together as a cohesive quiz",
    ),
  selectedQuestions: z
    .array(
      z.object({
        questionUid: z.string().describe("The UID of the selected question"),
        reasoning: z
          .string()
          .describe("Brief explanation for selecting this question"),
      }),
    )
    .length(6)
    .describe("Exactly 6 questions to include in the final quiz"),
});

export type CompositionResponse = z.infer<typeof CompositionResponseSchema>;

export function buildCompositionPrompt(
  questionPools: QuizQuestionPool[],
  lessonPlan: PartialLessonPlan,
  quizType: QuizPath,
): string {
  const lessonPlanUnpacked = unpackLessonPlanForPrompt(lessonPlan);

  const sections = [
    buildSystemContext(),
    buildQuizTypeInstructions(lessonPlan, quizType),
    `LESSON PLAN:\n${lessonPlanUnpacked}`,
    buildCandidatePoolsHeader(),
    ...questionPools.map((pool, idx) => formatPool(pool, idx)),
    buildCompositionRequirements(quizType),
  ];

  return sections.join("\n");
}

function buildSystemContext(): string {
  return dedent`
    You are a mathematics education specialist composing a quiz for Oak National Academy, leaders in UK teaching.

    ${quizEffectivenessPrompt}
  `;
}

function buildQuizTypeInstructions(
  lessonPlan: PartialLessonPlan,
  quizType: QuizPath,
): string {
  if (quizType === "/starterQuiz") {
    return buildStarterQuizInstructions(lessonPlan);
  }
  return buildExitQuizInstructions(lessonPlan);
}

function buildStarterQuizInstructions(lessonPlan: PartialLessonPlan): string {
  const priorKnowledge = lessonPlan.priorKnowledge || [];
  const priorKnowledgeList =
    priorKnowledge.length > 0
      ? `\n\nPrior knowledge to assess:\n${priorKnowledge.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
      : "";

  return dedent`
    TASK: Compose a starter quiz for this lesson.

    The purpose of the starter quiz is to:
    - Assess students' prior knowledge
    - Identify misconceptions
    - Reactivate prerequisite concepts

    Your quiz MUST align with the "prior knowledge" section of the lesson plan.${priorKnowledgeList}
  `;
}

function buildExitQuizInstructions(lessonPlan: PartialLessonPlan): string {
  const keyLearningPoints = lessonPlan.keyLearningPoints || [];
  const learningPointsList =
    keyLearningPoints.length > 0
      ? `\n\nKey learning points to assess:\n${keyLearningPoints.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
      : "";

  return dedent`
    TASK: Compose an exit quiz for this lesson.

    The purpose of the exit quiz is to:
    - Assess learning outcomes
    - Identify misconceptions
    - Consolidate the learning

    Your quiz MUST align with the "key learning points" and "learning outcome" sections of the lesson plan.${learningPointsList}
  `;
}

function buildCandidatePoolsHeader(): string {
  return dedent`

    ---

    CANDIDATE QUESTION POOLS:

    I have retrieved candidate questions from multiple sources. Your task is to select EXACTLY 6 questions that work together as a cohesive, pedagogically sound quiz.
  `;
}

function formatPool(pool: QuizQuestionPool, poolIndex: number): string {
  const header = formatPoolHeader(pool, poolIndex);
  const questions = pool.questions
    .map((q, qIdx) => formatQuestion(q, poolIndex, qIdx))
    .join("");

  return `${header}\n\nQuestions in this pool (${pool.questions.length}):\n${questions}`;
}

function formatPoolHeader(pool: QuizQuestionPool, poolIndex: number): string {
  // TODO: do we have enough info about what each type of pool is?
  const lines = [`\n## Pool ${poolIndex + 1}: `];

  if (pool.source.type === "mlSemanticSearch") {
    lines.push(`ML Semantic Search`);
    lines.push(`Search query: "${pool.source.semanticQuery}"`);
  } else if (pool.source.type === "basedOn") {
    lines.push(`User-selected "Based On" Lesson`);
    lines.push(
      `Source: ${pool.source.lessonTitle} (${pool.source.lessonPlanId})`,
    );
  } else if (pool.source.type === "ailaRag") {
    lines.push(`Similar lessons RAG`);
    lines.push(
      `Source: ${pool.source.lessonTitle} (${pool.source.lessonPlanId})`,
    );
  }

  return lines.join("\n");
}

function formatQuestion(
  question: QuizQuestionWithRawJson,
  poolIndex: number,
  questionIndex: number,
): string {
  const questionUid = question.rawQuiz[0]?.questionUid || "unknown";
  const answers = question.answers
    .map((answer, i) => `${i + 1}. ${answer}`)
    .join("\n");
  const distractors = question.distractors
    .map((distractor, i) => `${i + 1}. ${distractor}`)
    .join("\n");

  return dedent`

    ### Question ${poolIndex + 1}.${questionIndex + 1} [UID: ${questionUid}]
    ${question.question}

    Correct answer(s):
    ${answers}

    Distractors:
    ${distractors}
  `;
}

function buildCompositionRequirements(quizType: QuizPath): string {
  const focusArea =
    quizType === "/starterQuiz"
      ? "all prior knowledge points"
      : "all key learning points";

  return dedent`

    ---

    COMPOSITION REQUIREMENTS:

    1. **Coverage**: Ensure the quiz addresses ${focusArea}
    2. **Diversity**: Include questions at different cognitive levels (recall, application, analysis)
    3. **Balance**: Mix question types and difficulty levels appropriately
    4. **Pedagogical soundness**: Questions should work together as a cohesive assessment
    5. **Quality**: Prioritize clear, well-written questions with good distractors

    Select EXACTLY 6 questions. For each selection, provide:
    - The questionUid (from the [UID: ...] label)
    - Brief reasoning for why you selected it

    Also provide a brief overall strategy explaining how your selections work together.
  `;
}
