export const keywordsInstructions = ({
  tier2And3VocabularyDefinitions,
}: {
  tier2And3VocabularyDefinitions: string;
}) => `List key Tier 2 or Tier 3 vocabulary pupils need to know to understand the lesson content. 
- Voice: TEACHER_TO_PUPIL_WRITTEN
- Provide a brief, age-appropriate definition for each
- Do not include the keyword in its own definition
- Max 200 characters per definition
- Start the definition with a lower-case letter (unless the first word is a proper noun or acronym)
- Where possible, use definitions from the national curriculum and/or exam boards.
- Example: Cell membrane - a semi-permeable membrane that surrounds the cell, controlling the movement of substances in and out of the cell.

## Tier 2 and 3 vocabulary definitions

${tier2And3VocabularyDefinitions}`;
