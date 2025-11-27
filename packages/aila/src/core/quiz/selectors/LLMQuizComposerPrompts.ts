import dedent from "dedent";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import { quizEffectivenessPrompt } from "../QuestionAssesmentPrompt";
import type { QuizQuestionPool, RagQuizQuestion } from "../interfaces";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";

function buildQuestionSelectionCriteria(quizType: QuizPath): string {
  const relevanceDescription =
    quizType === "/starterQuiz"
      ? "Questions address the specific prior knowledge outlined in the lesson plan and probe the depth of understanding of prerequisite concepts."
      : "Questions target the key learning points and learning outcome, requiring students to demonstrate understanding of the core concepts.";

  return dedent`
    SELECTION CRITERIA:

    An effective quiz has:

    1. **Relevance**: ${relevanceDescription}

    2. **Cognitive range**: A mix of recall, application, and analysis questions appropriate to the lesson objectives. Questions should match the appropriate level of thinking for the lesson's objectives, challenging students to think critically rather than merely recall information.

    3. **Clarity**: Questions are clear, unambiguous, and focused on specific knowledge or skills rather than being overly broad.

    4. **Diagnostic value**: Answers reveal student understanding, potential misconceptions, and gaps in knowledge. Good quiz questions provide valuable information that helps identify what needs to be addressed during the lesson.

    5. **Answer quality**: Answer options are well-designed. Correct answers are unambiguous, and incorrect options reflect common misconceptions, helping diagnose student misunderstandings.
  `;
}

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
  const sections = [
    buildSystemContext(),
    "---",
    buildQuizTypeInstructions(lessonPlan, quizType),
    "---",
    buildQuestionSelectionCriteria(quizType),
    "---",
    buildLessonPlanSummary(lessonPlan),
    "---",
    buildCandidatePoolsHeader(),
    ...questionPools.map((pool, idx) => poolToMarkdown(pool, idx)),
  ];

  return sections.join("\n\n");
}

function buildSystemContext(): string {
  return "You are a mathematics education specialist selecting quiz questions for Oak National Academy lesson plans.";
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

    Your quiz must align with the "prior knowledge" section of the lesson plan.${priorKnowledgeList}
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

    Your quiz must align with the "key learning points" and "learning outcome" sections of the lesson plan.${learningPointsList}
  `;
}

function buildLessonPlanSummary(lessonPlan: PartialLessonPlan): string {
  return `LESSON PLAN:

${unpackLessonPlanForPrompt(lessonPlan)}`;
}

function buildCandidatePoolsHeader(): string {
  return dedent`
    CANDIDATE QUESTIONS:

    Below are candidate questions from Oak's existing lesson data. Select 6 questions that work together as a cohesive, pedagogically sound quiz.
  `;
}

function poolToMarkdown(pool: QuizQuestionPool, poolIndex: number): string {
  const header = poolHeaderMarkdown(pool, poolIndex);
  const questions = pool.questions.map((q) => questionToMarkdown(q)).join("\n\n");

  return `${header}\n\n${questions}`;
}

function poolHeaderMarkdown(pool: QuizQuestionPool, poolIndex: number): string {
  if (pool.source.type === "mlSemanticSearch") {
    return dedent`
      ## Pool ${poolIndex + 1}: ML Semantic Search
      Search query: "${pool.source.semanticQuery}"
    `;
  } else if (pool.source.type === "basedOn") {
    return dedent`
      ## Pool ${poolIndex + 1}: User-selected source lesson
      Source: ${pool.source.lessonTitle} (${pool.source.lessonPlanId})
    `;
  } else {
    return dedent`
      ## Pool ${poolIndex + 1}: RAG lesson on a similar topic
      Source: ${pool.source.lessonTitle} (${pool.source.lessonPlanId})
    `;
  }
}

function questionToMarkdown(question: RagQuizQuestion): string {
  const q = question.question;

  switch (q.questionType) {
    case "multiple-choice": {
      const answers = q.answers.map((a, i) => `${i + 1}. ${a}`).join("\n");
      const distractors = q.distractors
        .map((d, i) => `${i + 1}. ${d}`)
        .join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Multiple Choice
        ${q.question}

        Correct answer(s):
        ${answers}

        Distractors:
        ${distractors}
      `;
    }

    case "short-answer": {
      const answers = q.answers.map((a, i) => `${i + 1}. ${a}`).join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Short Answer
        ${q.question}

        Acceptable answer(s):
        ${answers}
      `;
    }

    case "match": {
      const pairs = q.pairs
        .map((p, i) => `${i + 1}. ${p.left} → ${p.right}`)
        .join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Match
        ${q.question}

        Correct pairs:
        ${pairs}
      `;
    }

    case "order": {
      const items = q.items.map((item, i) => `${i + 1}. ${item}`).join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Order
        ${q.question}

        Correct order:
        ${items}
      `;
    }

    default: {
      const _exhaustiveCheck: never = q;
      throw new Error(
        `Unknown question type: ${(_exhaustiveCheck as { questionType: string }).questionType}`,
      );
    }
  }
}
