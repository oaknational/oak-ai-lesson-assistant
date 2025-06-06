import type { ContextByMaterialType } from "../configSchema";
import { getLessonDetails, language } from "../promptHelpers";
import {
  type AllowedReadingAgeRefinement,
  readingAgeRefinementMap,
} from "./schema";

export const buildGlossaryPrompt = (
  context: ContextByMaterialType["additional-glossary"],
) => {
  const { lessonPlan } = context;

  if (context.refinement) {
    return refineGlossaryPrompt(context);
  }

  return `
 Make a glossary for pupils based on the following lesson details: 

  **Lesson Details**:
  ${getLessonDetails(lessonPlan)}
      `;
};

const refineGlossaryPrompt = (
  context: ContextByMaterialType["additional-glossary"],
) => {
  const { lessonPlan, previousOutput } = context;
  return `Modify the following glossary based on user feedback.
  
  **Previous Output**:  
  ${JSON.stringify(previousOutput, null, 2)}
  
  **User Request**:  
  ${context.refinement && context.refinement.map((r) => readingAgeRefinementMap[r.type as AllowedReadingAgeRefinement]).join("\n")}
  
  Adapt the glossary to reflect the request while ensuring it continues to aligns with the following lesson details:
  
  ${getLessonDetails(lessonPlan)}
      `;
};

export const buildGlossarySystemMessage = () => {
  return `
You are an expert UK teacher generating a glossary based on a provided lesson details.

Make a glossary for a class of pupils in the UK .
The glossary should be structured and include all the following parts and should match the given schema:
The GLOSSARY should include all tier 2 and tier 3 words in the lesson content. 
Tier 2 words are cross-curricular, academic words that pupils are likely to encounter across multiple subjects.  These may be found less frequently in everyday conversation but are very commonly found in written texts.  They are more commonly used amongst mature language users e.g. evaluate, required, fortunate, soar. They often have different meanings in different disciplines e.g. product, force, volume.
Tier 3 words are subject specific, academic words. There are used more rarely and are specific to certain domains and disciplines.  Examples include osmosis, denominator and aliteration. 
Organise the words in alphabetical order.
You should include the keyword in bold, followed by a semicolon and a definition. The definition must be age-appropriate and should not include the keyword itself in the definition.
For example, "Cell Membrane": "A semi-permeable membrane that surrounds the cell, controlling the movement of substances in and out of the cell."
Try to make your definitions as succinct as possible.
The definition should be no longer than 200 characters.

**Rules**:
- **Do not** include markdown in your response.
- definitions start with lower case (unless it is a known acronym or proper noun) and end with a full stop.
- terms start with capital letter.
- minimum of 10 terms, maximum of 15 terms.
- include the key words from the lesson plan.

${language}
  `;
};
