import { quizQuestionDesignInstructions } from "../shared/quizQuestionDesign.instructions";

export function starterQuizInstructions(keyStage: string): string {
  return `# Task

Create a 6-question multiple-choice quiz to assess PRIOR KNOWLEDGE ONLY — do not include or hint at new lesson content.

## Content Scope:

- Base questions on the PRIOR KNOWLEDGE TO ASSESS section provided below
- Do not test or mention any of this lesson's key learning points
- Content should be age-appropriate
- Questions should increase in difficulty
- Designed so the average pupil scores 5 out of 6.
- If a pupil gets all of the questions correct, they should have good understanding of the PRIOR KNOWLEDGE required for the lesson.

## Question Design

${quizQuestionDesignInstructions(keyStage)}`;
}

export function addOneQuizInstructions(keyStage: string): string {
  return `# Task

Generate exactly ONE new multiple-choice question to ADD to the existing quiz. Do not output, modify, or restate the existing questions — they will be preserved by the system.

## Content Scope

- The new question must assess prior knowledge from the PRIOR KNOWLEDGE TO ASSESS section provided below.
- It must not overlap with the existing questions or test new lesson content.

## Question Design

${quizQuestionDesignInstructions(keyStage)}`;
}

export const rewriteOneQuizInstructions = (
  position: number,
  keyStage: string,
): string =>
  `# Task

Rewrite question ${position} of the existing quiz. Return only the replacement question. Do not modify or output any of the other questions — they will be preserved by the system.

## Content Scope

- The replacement question must assess prior knowledge from the PRIOR KNOWLEDGE TO ASSESS section provided below.
- It must not overlap with the other questions or test new lesson content.

## Question Design

${quizQuestionDesignInstructions(keyStage)}`;
