import {
  getKeyStageContentSelectionGuidance,
  getKeyStageLanguageGuidance,
  normaliseKeyStageForPrompt,
} from "../shared/keyStageLanguageGuidance";

function ksSpecificPriorKnowledgeGuidance(keyStage: string): string {
  if (keyStage === "ks1" || keyStage === "ks2") {
    const ageRange = keyStage === "ks1" ? "5–7" : "7–11";
    const yearRange = keyStage === "ks1" ? "Year 1–2" : "Year 3–6";

    return `### Prior knowledge language for ${keyStage.toUpperCase()} (ages ${ageRange}, ${yearRange})

This section is teacher-facing, but each statement must describe what pupils already know in terms that reflect how those pupils actually hold that knowledge — not in the language of a textbook or curriculum document. Choose starting points pupils can use directly in the lesson: things they know, can do, have seen, have read, or can explain simply. Do not choose adult analytical categories as prior knowledge. A teacher reading it should think "yes, my class knows it like that." If a pupil could not say the concept in those words, rephrase it.`;
  }

  if (keyStage === "ks3") {
    return `### Prior knowledge language for KS3 (ages 11–14, Years 7–9)

Describe concepts at the level pupils hold them — academic vocabulary is developing but should not be assumed. Avoid describing prior knowledge in the register of a GCSE or A-level student.`;
  }

  return "";
}

export function priorKnowledgeInstructions(keyStage: string): string {
  const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
  return `# Task

List up to 5 relevant concepts that pupils should already know before this lesson. This knowledge should be necessary for success in the lesson being planned.

- Max 30 words per statement.
- Max 5 statements but aim for fewer
- Use age-appropriate, key stage-relevant concepts and language.
- Try to be specific with the concepts.
- Do not start with "Pupils…"—just state the concept
- May include substantive, disciplinary, or procedural concepts
- Avoid content that's too advanced
- Examples: "Knowing the main characters and events in a familiar fairy tale." "Knowing what a ruler is." "Being able to recognise safe and unsafe choices when using technology".
- Non-example: "Knowledge of fairy tales" (too broad).
- Each statement must describe what pupils need in order to START the lesson — not what they will learn during it. Prior knowledge enables engagement; it does not pre-teach the lesson. A pupil who has all the prior knowledge listed should still have everything to learn. If the lesson introduces a concept or definition, that concept or definition is not prior knowledge.
  ✓ "Able to read and write simple sentences." (enables engagement with a grammar lesson)
  ✗ "Knowing that a noun is a word that names a person, place, thing, or idea." (this IS what the lesson teaches)

${ksSpecificPriorKnowledgeGuidance(normalisedKeyStage)}

${getKeyStageContentSelectionGuidance(normalisedKeyStage)}

${getKeyStageLanguageGuidance(normalisedKeyStage)}`;
}
