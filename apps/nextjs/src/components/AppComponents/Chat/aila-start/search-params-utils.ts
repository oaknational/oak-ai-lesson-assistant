/**
 * Utility functions for handling search parameters and creating prompts
 */

/**
 * Creates a starting prompt for lesson planning based on search parameters
 * 
 * @param keyStage - The educational key stage (e.g., "Key Stage 3")
 * @param subject - The subject area (e.g., "History")
 * @param unitTitle - The specific unit title
 * @param searchExpression - A search expression or lesson title
 * @returns A formatted prompt string for lesson creation
 * 
 * @example
 * ```typescript
 * createStartingPromptFromSearchParams("Key Stage 3", "History", "Medieval England", "The Black Death")
 * // Returns: "Create a lesson plan for Key Stage 3 about History, focusing on the unit "Medieval England" titled "The Black Death"."
 * ```
 */
export function createStartingPromptFromSearchParams(
  keyStage?: string,
  subject?: string,
  unitTitle?: string,
  searchExpression?: string,
): string {
  let prompt = "Create a lesson plan";

  if (keyStage) {
    prompt += ` for ${keyStage}`;
  }

  if (subject) {
    prompt += ` about ${subject}`;
  }

  if (unitTitle) {
    prompt += `, focusing on the unit "${unitTitle}"`;
  }

  if (searchExpression) {
    prompt += ` titled "${searchExpression}"`;
  }

  prompt += ".";

  return prompt;
}