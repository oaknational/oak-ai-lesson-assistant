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
  let prompt = "Create a lesson plan on";

  if (searchExpression) {
    prompt += ` ${searchExpression}`;
  } else {
    prompt += ` [insert title here]`;
  }

  // Always add "for" if we have any context info
  if (keyStage || subject || unitTitle) {
    prompt += " for";

    if (keyStage) {
      prompt += ` ${keyStage.toUpperCase()}`;
    }

    if (subject) {
      const capitalizedSubject =
        subject.charAt(0).toUpperCase() + subject.slice(1);
      prompt += ` ${capitalizedSubject}`;
    }

    if (unitTitle) {
      if (keyStage || subject) {
        prompt += ` unit "${unitTitle}"`;
      } else {
        prompt += ` the unit "${unitTitle}"`;
      }
    }
  }

  prompt += ".";

  return prompt;
}
