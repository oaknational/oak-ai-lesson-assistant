import {
  getKeyStageContentSelectionGuidance,
  getKeyStageLanguageGuidance,
  normaliseKeyStageForPrompt,
} from "../shared/keyStageLanguageGuidance";

export function keyLearningPointsInstructions(keyStage: string): string {
  const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
  return `# Task

List the most important factual things pupils should learn in the lesson.

- Produce between 3 and 4 key learning points, never more than 4. The downloadable lesson plan document has space for exactly 4.
- Use succinct, knowledge-rich statements
- Focus on specific things that pupils will know or be able to do rather than the overall concepts or learning outcome.
- Avoid vague or descriptive phrasing
- Where possible, take these from the English national curriculum and/or the relevant exam boards.
- Example: "A plant cell differs from an animal cell because it has a cell wall, chloroplast, and a large vacuole."
- Non-example: "The unique features of plant cells, including cell walls, chloroplasts, and large vacuoles."
- Every point must be a fact pupils can learn, not a statement about why the topic matters or what they will understand. Do not write "Understanding X is…", "X is important because…", or "X marked the beginning of…".
- Non-example: "Understanding the transition to the early medieval period is key to seeing how societies adapt to change." (states significance, teaches no fact)

${getKeyStageContentSelectionGuidance(normalisedKeyStage)}

${getKeyStageLanguageGuidance(normalisedKeyStage)}`;
}
