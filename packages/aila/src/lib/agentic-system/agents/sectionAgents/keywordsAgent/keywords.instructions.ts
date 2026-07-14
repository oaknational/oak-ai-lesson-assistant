import {
  getKeyStageContentSelectionGuidance,
  getKeyStageKeywordDefinitionGuidance,
  getKeyStageLanguageGuidance,
  normaliseKeyStageForPrompt,
} from "../shared/keyStageLanguageGuidance";
import type { PositionPlaceholder } from "../shared/positionPlaceholder";
import { tier2And3VocabularyDefinitions } from "../shared/tier2And3VocabularyDefinitions";

export function keywordsInstructions(keyStage: string): string {
  const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
  return `# Task

List key Tier 2 or Tier 3 vocabulary pupils need to know to understand the lesson content.

- Provide a brief, age-appropriate definition for each
- Do not include the keyword in its own definition
- Max 200 characters per definition
- Where possible, use definitions from the national curriculum and/or exam boards.
- Example: { keyword: "Cell membrane", definition: "A semi-permeable membrane that surrounds the cell, controlling the movement of substances in and out of the cell." }

${getKeyStageContentSelectionGuidance(normalisedKeyStage)}

${getKeyStageKeywordDefinitionGuidance(normalisedKeyStage)}

## Tier 2 and 3 vocabulary definitions

${tier2And3VocabularyDefinitions}

${getKeyStageLanguageGuidance(normalisedKeyStage)}`;
}

export function addOneKeywordInstructions(keyStage: string): string {
  const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
  return `# Task

Generate exactly ONE new keyword (with its definition) to ADD to the existing list. Return only that single keyword. Do not output, modify, or restate the existing keywords — they will be preserved by the system.

- Provide a brief, age-appropriate definition
- Do not include the keyword in its own definition
- Max 200 characters for the definition
- Where possible, use definitions from the national curriculum and/or exam boards.

${getKeyStageContentSelectionGuidance(normalisedKeyStage)}

${getKeyStageKeywordDefinitionGuidance(normalisedKeyStage)}

## Tier 2 and 3 vocabulary definitions

${tier2And3VocabularyDefinitions}

${getKeyStageLanguageGuidance(normalisedKeyStage)}`;
}

export function changeOneKeywordInstructions(
  position: number | PositionPlaceholder,
  keyStage: string,
): string {
  const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
  return `# Task

Rewrite keyword ${position} of the existing list. Return only the single replacement keyword (with its definition). Do not modify or output any of the other keywords — they will be preserved by the system.

- Provide a brief, age-appropriate definition
- Do not include the keyword in its own definition
- Max 200 characters for the definition
- Where possible, use definitions from the national curriculum and/or exam boards.

${getKeyStageKeywordDefinitionGuidance(normalisedKeyStage)}

## Tier 2 and 3 vocabulary definitions

${tier2And3VocabularyDefinitions}

${getKeyStageLanguageGuidance(normalisedKeyStage)}`;
}
