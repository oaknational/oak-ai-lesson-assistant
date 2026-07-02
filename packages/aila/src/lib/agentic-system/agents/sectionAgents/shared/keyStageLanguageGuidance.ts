import { parseKeyStage } from "@oakai/core/src/data/parseKeyStage";

/**
 * Key stage language and vocabulary guidance.
 * Returns focused guidance for only the relevant key stage rather than a
 * full reference table, keeping prompts short and unambiguous.
 *
 * The key stage is always available in the CURRENT DOCUMENT JSON.
 */

function ks1Guidance(): string {
  return `## KS1 Language Guidance (ages 5–7, Years 1–2)

Very short sentences, one idea each, fully concrete — words a 5–7-year-old understands when read aloud. Scaffold any unfamiliar subject word: define it, add it to the keyword list, or show it with a concrete example before using it freely.

This is the Oak KS1 register:
✓ "Different animals have different parts to their bodies. Different body parts help animals to do different things."
✗ "Animals possess varied anatomical structures adapted to their functional needs."

Command words: name, sort, match, draw, circle. Test: could a 6-year-old understand this with the lesson support provided?`;
}

function ks2Guidance(): string {
  return `## KS2 Language Guidance (ages 7–11, Years 3–6)

Plain, everyday English throughout — all content, not just tasks. Keep essential subject vocabulary; drop the academic wrapper around it. Be concrete and specific, told as who did what: name the real people, places, dates and events rather than summarising them abstractly. Plain language follows from concrete content — abstraction is what forces a formal register.

This is the Oak KS2 register:
✓ "In 401 CE, the last Roman legionaries left Hadrian's Wall, built 200 years before to protect the northern frontier."
✗ "The Roman Empire faced increasing external pressures, leading the military to be withdrawn from Britain."

Command words: describe, explain, identify, list, compare, suggest. Do not use evaluate, analyse, justify, or assess — even in the final learning cycle. Test: could a 10-year-old read this without adult support?`;
}

function ks3Guidance(): string {
  return `## KS3 Language Guidance (ages 11–14, Years 7–9)

Academic vocabulary is developing but should not reach GCSE level — especially in Years 7–8. Prefer active, direct sentences, and introduce an abstract concept with a concrete example first.

This is the Oak KS3 register:
✓ "Weather is the day-to-day atmospheric conditions, whereas climate is the average weather conditions over 30 years."
✗ "Climatic variability must be distinguished from ephemeral meteorological phenomena." (GCSE/A-level register — too high for KS3)

Command words: describe, explain, identify, suggest, compare, summarise, give reasons for. Use analyse with scaffolding; avoid evaluate and justify as standalone command words. Test: Is this language suitable for a Year 8 classroom?`;
}

function ks4Guidance(): string {
  return `## KS4 Language Guidance (ages 14–16, Years 10–11)

Full GCSE register throughout; subject-specific vocabulary is expected and should be used accurately and precisely — not avoided or watered down.

This is the Oak KS4 register:
✓ "Enzymes are proteins that act as catalysts, speeding up chemical reactions. Each enzyme has a 3D shape with an active site that a specific substrate fits into."
✗ "Enzymes are special things in the body that help reactions go faster." (too vague — loses the required subject precision)

Use exam command words precisely — state, identify, describe, explain, analyse, evaluate, justify — and match each to the intended cognitive demand. Test: does this match GCSE assessments for this subject?`;
}

/**
 * Returns a short key-stage code for prompt branching.
 * Accepts aliases such as "key-stage-2", "Key stage 2", "year_4", and "ks2".
 */
export function normaliseKeyStageForPrompt(keyStage: string): string {
  switch (parseKeyStage(keyStage)) {
    case "key-stage-1":
      return "ks1";
    case "key-stage-2":
      return "ks2";
    case "key-stage-3":
      return "ks3";
    case "key-stage-4":
      return "ks4";
    case "key-stage-5":
      return "ks5";
    default:
      return keyStage;
  }
}

/**
 * Returns focused language guidance for the given key stage.
 * Pass ctx.currentTurn.document.keyStage ?? "".
 */
export function getKeyStageLanguageGuidance(keyStage: string): string {
  switch (normaliseKeyStageForPrompt(keyStage)) {
    case "ks1":
      return ks1Guidance();
    case "ks2":
      return ks2Guidance();
    case "ks3":
      return ks3Guidance();
    case "ks4":
      return ks4Guidance();
    default:
      return `## Key Stage Language Guidance

Use clear, age-appropriate language suitable for the key stage shown in CURRENT DOCUMENT. Avoid unnecessarily complex vocabulary or abstract reasoning unless the key stage warrants it.`;
  }
}

/**
 * Returns guidance for choosing the right level of concept before wording it.
 * This keeps early lesson-planning sections from selecting adult analytical
 * labels that later sections then inherit.
 */
export function getKeyStageContentSelectionGuidance(keyStage: string): string {
  switch (normaliseKeyStageForPrompt(keyStage)) {
    case "ks1":
      return `## KS1 Content Selection Guidance

Choose concrete content pupils can see, name, sort, match, draw, say, or do. Avoid umbrella concepts unless the lesson explicitly teaches them through examples.`;
    case "ks2":
      return `## KS2 Content Selection Guidance

Choose the smallest pupil-usable concept that unlocks the lesson. Prefer concrete ideas pupils can use in an explanation, question, or task over adult planning shorthand. If a broad abstract term is useful for planning but pupils would not need to say or use it, choose the concrete underlying idea instead.`;
    default:
      return "";
  }
}

/**
 * Returns focused keyword definition guidance for the given key stage.
 * Pass ctx.currentTurn.document.keyStage ?? "".
 */
export function getKeyStageKeywordDefinitionGuidance(keyStage: string): string {
  switch (normaliseKeyStageForPrompt(keyStage)) {
    case "ks1":
      return `## Keyword Definition Guidance (KS1)

Write each definition in one short sentence (≤12 words) using only words a 5–7-year-old already knows, as if saying it aloud to the pupil. No technical language in the definition itself.
✓ "An animal is a living thing which moves and eats other animals or plants."`;
    case "ks2":
      return `## Keyword Definition Guidance (KS2)

Write each definition in one or two short sentences (≤20 words total), in plain everyday language (reading age 8–10), as if explaining it aloud to the pupil. If a definition needs another subject-specific word, define that too or rephrase to avoid it.
✓ "Romanisation is when people started living and acting like the Romans did."
✗ "Romanisation: the process by which a culture adopts Roman customs and institutions."`;
    case "ks3":
      return `## Keyword Definition Guidance (KS3)

Write each definition in up to two sentences. Prefer clear, accessible language over technical language. Avoid circular definitions.
✓ "Climate is an average of weather conditions in a place taken over a long period of time, usually 30 years or more."`;
    case "ks4":
      return `## Keyword Definition Guidance (KS4)

Write precise definitions aligned with GCSE mark scheme expectations. Subject-specific language is acceptable where it has already been taught in the lesson.
✓ "A catalyst is a substance that speeds up the rate of a reaction without being used up."`;
    default:
      return `## Keyword Definition Guidance

Write concise, age-appropriate definitions. Avoid technical language in definitions where possible — define the keyword in terms the pupil already understands.`;
  }
}
