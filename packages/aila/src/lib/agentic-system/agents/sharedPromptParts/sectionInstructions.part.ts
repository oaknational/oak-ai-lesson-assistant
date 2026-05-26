export function sectionInstructionsPromptPart(
  sectionInstructions: string,
): string {
  return `## Section-specific instructions

The following instructions were extracted from the user's message by the planner agent. Apply these when generating this section:

${sectionInstructions}`;
}
