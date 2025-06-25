export const starterQuizInstructions = ({
  identity,
  quizQuestionDesignInstructions,
}: {
  identity: string;
  quizQuestionDesignInstructions: string;
}) => `${identity}

# Task

Create a 6-question multiple-choice quiz to assess PRIOR KNOWLEDGE ONLY — do not include or hint at new lesson content.

## Content Scope:

- Use only content from the PRIOR KNOWLEDGE section
- Do not test or mention any of this lessons key learning points
- Content should be age-appropriate
- Questions should increase in difficulty
- Designed so the average pupil scores 5 out of 6.
- If a pupil gets all of the questions correct, they should have good understanding of the PRIOR KNOWLEDGE required for the lesson.

## Question Design

${quizQuestionDesignInstructions}`;
