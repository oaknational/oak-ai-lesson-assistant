import moderationCategories from "./moderationCategories.json";

type ModerationCategory = {
  title: string;
  abbreviation: string; 
  code: string;
  llmDescription: string;
  criteria5: string;
  criteria4?: string;
  criteria3?: string;
  criteria2?: string;
  criteria1: string;
};

export function generateNewModerationPrompt(categories: ModerationCategory[]): string {
  const categoryDetailsText = categories.map(cat => `
<category>
Category Title: '${cat.title}'
Output Score Code (Abbreviation): '${cat.abbreviation}'
Original Full Code (for context): '${cat.code}'
Description for Assessment: ${cat.llmDescription}
Rating Criteria:
- 5: ${cat.criteria5}${cat.criteria4 ? `
- 4: ${cat.criteria4}` : ""}${cat.criteria3 ? `
- 3: ${cat.criteria3}` : ""}${cat.criteria2 ? `
- 2: ${cat.criteria2}` : ""}
- 1: ${cat.criteria1}
</category>`).join('\n\n');

  return `OBJECTIVE:
You are a content moderation supervisor examining a lesson plan document. Your job is to:
1. Assess the lesson plan against a list of specific content categories detailed below.
2. Provide a 1-5 Likert score for EACH category. A score of 5 means the content is not present or not involved at all.
3. For ANY category that scores less than 5, provide a concise justification explaining why it received that score.

CATEGORIES FOR ASSESSMENT:
${categoryDetailsText}

IMPORTANT NOTES ON SCORING AND JUSTIFICATION:

*   Your primary goal is to provide content guidance. The score for each category must reflect the presence and significance of relevant content.
*   Pay close attention to the 'Original Full Code' provided for each category, especially for those starting with 'n/' (Not to be planned by Aila) or 't/' (Toxic). A score of 1-4 on these indicates serious issues and requires careful justification.
*   For all other categories, when determining a score, consider the Key Stage (age group) of the pupils if Key Stage is specified within the lesson plan.

INSTRUCTION:

Your response MUST be a valid JSON object.
Use the 'Output Score Code (Abbreviation)' provided for each category as the key in your JSON response. All categories listed above MUST be included in your response, even if they score 5. Any category that scores less than 5 must have a justification provided in the 'justifications' object, using the same 'Output Score Code (Abbreviation)' as the key. If all categories score 5, the 'justifications' object must be empty: {}.

Provide a JSON response with the following top-level keys:

1.  'scores': An object.
    *   Keys: The 'Output Score Code (Abbreviation)' (e.g., 'l1', 'u2') for EACH category listed above.
    *   Values: The 1-5 Likert scale rating for that category. EVERY category detailed above MUST have a score in this object using its 'Output Score Code (Abbreviation)'.

2.  'justifications': An object (dictionary).
    *   Keys: The 'Output Score Code (Abbreviation)' of a category ONLY IF its score in the 'scores' object is less than 5.
    *   Values: A string containing a concise, precise justification.
    *   If all categories score 5, this field MUST be an empty object: {}.

3.  'flagged_categories': A list of strings.
    *   Each string must be the 'Output Score Code (Abbreviation)' of a category ONLY IF its score in the 'scores' object is less than 5.
    *   If all categories score 5, this field MUST be an empty list: [].
`;
}

export const moderationPrompt = generateNewModerationPrompt(moderationCategories as ModerationCategory[]);
