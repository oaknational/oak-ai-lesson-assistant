import dedent from "dedent";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  EnrichedImageMetadata,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../interfaces";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";

/**
 * Replace markdown images with text descriptions for LLM context.
 * Uses aiDescription from imageMetadata when available.
 */
function replaceImagesWithDescriptions(
  text: string,
  imageMetadata: EnrichedImageMetadata[],
): string {
  return text.replaceAll(
    /!\[([^\]]*)\]\(([^)]{1,2000})\)/g,
    (match, _alt, url: string) => {
      const meta = imageMetadata.find((m) => m.imageUrl === url);
      return meta?.aiDescription ? `[IMAGE: ${meta.aiDescription}]` : match;
    },
  );
}

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
      "Explain your selection strategy: which sources you prioritised, " +
        "why you did or didn't use questions from the user-selected source lesson (if provided), " +
        "and how the selected questions work together as a cohesive quiz",
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
    buildSourceTypesExplanation(),
    "---",
    buildCandidateQuestionsHeader(),
    ...questionPools.map((pool) => poolToMarkdown(pool)),
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

function buildSourceTypesExplanation(): string {
  return dedent`
    UNDERSTANDING THE QUESTION SOURCES:

    You will receive questions from up to three source types. Understanding these helps you make better selections:

    **User-Selected Source Lesson**
    If present, the user explicitly chose to base their lesson on this Oak lesson. This signals strong intent—prioritise these questions heavily. This is a complete quiz designed as a coherent unit with intentional difficulty progression. If it aligns with the lesson plan, you may use it largely as-is.

    **Reference Quizzes from Similar Lessons**
    Oak expert-authored quizzes from lessons on similar topics. These demonstrate good quiz structure: topic coverage, difficulty progression, and question variety. The ordering within each quiz is intentional. Use these as examples of quality and select individual questions that fit.

    **Semantically Matched Questions**
    Individual questions retrieved via semantic search against lesson objectives. These are not structured quizzes—just relevant questions. No inherent ordering. Use these to cover concepts the other sources don't address.
  `;
}

function buildCandidateQuestionsHeader(): string {
  return "CANDIDATE QUESTIONS:";
}

function poolToMarkdown(pool: QuizQuestionPool): string {
  const header = poolHeaderMarkdown(pool);
  const questions = pool.questions
    .map((q) => questionToMarkdown(q))
    .join("\n\n");

  return `${header}\n\n${questions}`;
}

function poolHeaderMarkdown(pool: QuizQuestionPool): string {
  if (pool.source.type === "basedOnLesson") {
    return `### User-Selected Source Lesson: ${pool.source.lessonTitle}`;
  } else if (pool.source.type === "semanticSearch") {
    return `### Semantically Matched Questions (query: "${pool.source.semanticQuery}")`;
  } else {
    return `### Reference Quiz: ${pool.source.lessonTitle}`;
  }
}

function questionToMarkdown(question: RagQuizQuestion): string {
  const q = question.question;
  const format = (text: string) =>
    replaceImagesWithDescriptions(text, question.imageMetadata);

  switch (q.questionType) {
    case "multiple-choice": {
      const answers = q.answers
        .map((a, i) => `${i + 1}. ${format(a)}`)
        .join("\n");
      const distractors = q.distractors
        .map((d, i) => `${i + 1}. ${format(d)}`)
        .join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Multiple Choice
        ${format(q.question)}

        Correct answer(s):
        ${answers}

        Distractors:
        ${distractors}
      `;
    }

    case "short-answer": {
      const answers = q.answers
        .map((a, i) => `${i + 1}. ${format(a)}`)
        .join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Short Answer
        ${format(q.question)}

        Acceptable answer(s):
        ${answers}
      `;
    }

    case "match": {
      const pairs = q.pairs
        .map((p, i) => `${i + 1}. ${format(p.left)} → ${format(p.right)}`)
        .join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Match
        ${format(q.question)}

        Correct pairs:
        ${pairs}
      `;
    }

    case "order": {
      const items = q.items
        .map((item, i) => `${i + 1}. ${format(item)}`)
        .join("\n");

      return dedent`
        ### Question UID:${question.sourceUid}
        Type: Order
        ${format(q.question)}

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
