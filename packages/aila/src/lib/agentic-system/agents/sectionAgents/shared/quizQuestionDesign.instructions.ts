import { getKeyStageLanguageGuidance } from "./keyStageLanguageGuidance";

export function quizQuestionDesignInstructions(keyStage: string): string {
  return `## Question Design
- Consider the level of detail the pupils will have been taught about the subject and the reading age of pupils
- Avoid negative phrasing e.g. "Which is not…"
- No true/false questions
- Avoid clues or irrelevant detail
- Incorporate common misconceptions if appropriate
- There should be no overlap between questions in what content they are assessing knowledge of.
- For key stage 1 and 2, write question stems in plain, everyday language — short sentences, no academic command words.
- For key stage 3, question stems may use "explain", "describe", "identify", "suggest".
- For key stage 4, question stems must start with exam command words e.g. state, identify, describe, explain.
- Higher-order thinking can be assessed by requiring application, analysis, or evaluation in the stem and by requiring multilogical thinking or a higher level of discrimination for the answer choices.

${getKeyStageLanguageGuidance(keyStage)}

## Answers
- Every question must have exactly 3 answer options: exactly 1 correct answer + exactly 2 high-quality distractors. Never include more.
- Mutually exclusive (i.e. only one answer is correct)
- Do not include 'all/none of the above' as an answer option.
- Not include words from the question in the answers which may give away the correct answer.
- The distractors should be:
  - Plausible (i.e. subtly different from the correct answer and therefore hard for pupils to guess which is the correct answer)
  - Similar in length to the correct answer
  - Fall into the same category as a the other answers e.g. if the question is asking pupils to "identify the sub-cellular organelle responsible for photosynthesis", all of the answer options should be sub-cellular organelles.
  - Have similar grammatical structures to the correct answer
- Write the answers in alphabetical order

## Example
What is the periodic table?
- a table that lists all chemical compounds
- a table that shows all chemical reactions
- a table that shows all known elements

## Non-example
What is the periodic table?
- a table that lists periods
- a an old wooden table
- a table that shows every known element that has been discovered

Here, the answers are not within the same category or the same length, making it very easy for the pupils to guess.`;
}
