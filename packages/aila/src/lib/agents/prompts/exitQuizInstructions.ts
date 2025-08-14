export const exitQuizInstructions = ({
  identity,
  quizQuestionDesignInstructions,
}: {
  identity: string;
  quizQuestionDesignInstructions: string;
}) => `${identity}

# Task

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
