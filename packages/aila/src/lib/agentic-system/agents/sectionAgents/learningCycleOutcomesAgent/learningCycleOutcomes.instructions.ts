import {
  getKeyStageContentSelectionGuidance,
  getKeyStageLanguageGuidance,
  normaliseKeyStageForPrompt,
} from "../shared/keyStageLanguageGuidance";

function getCommandVerbGuidance(keyStage: string): string {
  switch (keyStage) {
    case "ks1":
      return `### Command verbs for this key stage (KS1, ages 5–7)
Available verbs: Name, Identify, Label, Sort, Match, Draw, Circle, Describe, Recall, Make.
The third cycle should reach no higher than "Describe". Do not use Explain, Analyse, or Evaluate.`;

    case "ks2":
      return `### Command verbs for this key stage (KS2, ages 7–11)
Available verbs: Name, Identify, Label, State, Recall, List, Describe, Explain, Compare, Suggest, Write, Draw, Sort, Match, Create.
The third cycle should reach no higher than "Explain" or "Compare". Do not use Analyse, Evaluate, or Justify.`;

    case "ks3":
      return `### Command verbs for this key stage (KS3, ages 11–14)
Available verbs: Identify, Describe, Explain, Compare, Summarise, Discuss, Classify, Apply, Analyse.
The third cycle should reach "Analyse" or "Discuss" as the default ceiling. Evaluate is only appropriate for explicitly higher-order work; prefer Analyse when in doubt.`;

    case "ks4":
      return `### Command verbs for this key stage (KS4, ages 14–16)
Available verbs: State, Identify, Describe, Explain, Compare, Analyse, Discuss, Apply, Evaluate, Justify, Assess, Construct.
Use the full range of GCSE command words. Match each verb to its intended cognitive demand; Evaluate and Justify are appropriate for the third cycle where the lesson warrants it.`;

    default:
      return `### Command verbs
Choose verbs appropriate for the key stage shown in CURRENT DOCUMENT (e.g. Name, Identify, Label, State, Recall, Define, Sketch, Describe, Explain, Analyse, Discuss, Apply, Compare, Calculate, Construct, Manipulate, Evaluate).`;
  }
}

export function learningCycleTitlesInstructions(keyStage: string): string {
  const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
  return `# Task

LEARNING CYCLE OUTCOMES break the LEARNING OUTCOME into 1–3 manageable chunks, each aligned to a LEARNING CYCLE. These are statements that describe what pupils should know or be able to do by the end of the lesson.

- Phrase each as a command, starting with a verb.
- Max 20 words per LEARNING CYCLE OUTCOME.
- Example: "label the organelles in a plant cell".
- Ensure progression: these should increase in difficulty.
- State what pupils will DO — avoid meta-language like "demonstrating understanding of", "showing knowledge of", or "utilising". Write "write sentences using nouns and verbs", not "construct sentences utilising nouns and verbs, demonstrating understanding of their use".

${getCommandVerbGuidance(normalisedKeyStage)}

${getKeyStageContentSelectionGuidance(normalisedKeyStage)}

${getKeyStageLanguageGuidance(normalisedKeyStage)}`;
}
