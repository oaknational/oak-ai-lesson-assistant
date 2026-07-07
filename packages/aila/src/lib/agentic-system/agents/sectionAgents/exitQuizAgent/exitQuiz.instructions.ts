import { quizQuestionDesignInstructions } from "../shared/quizQuestionDesign.instructions";

export const exitQuizInstructions = `# Task

Create a 6-question multiple-choice quiz to assess pupil understanding of the lesson content.

## Content Scope

Questions must cover:

- KEY LEARNING POINTS
- A MISCONCEPTION
- Understanding of at least one KEYWORD (in context)
- Content should be age-appropriate
- Questions should increase in difficulty
- Designed so the average pupil scores 5 out of 6.
- If a pupil gets all of the questions correct, they should have good understanding of the KEY LEARNING POINTS in the lesson.

## Question Design

${quizQuestionDesignInstructions}`;

export const addOneQuizInstructions = `# Task

Generate exactly ONE new multiple-choice question to ADD to the existing quiz. Do not output, modify, or restate the existing questions — they will be preserved by the system.

## Question Design

${quizQuestionDesignInstructions}`;

const rewriteOneQuizInstructionText = (
  position: number | "{position}",
) => `# Task

Rewrite question ${position} of the existing quiz. Return only the replacement question. Do not modify or output any of the other questions — they will be preserved by the system.

## Question Design

${quizQuestionDesignInstructions}`;

export const rewriteOneQuizInstructionsTemplate =
  rewriteOneQuizInstructionText("{position}");

export const rewriteOneQuizInstructions = (position: number): string =>
  rewriteOneQuizInstructionText(position);
