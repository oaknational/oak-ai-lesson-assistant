import type { TemplateProps } from "..";

export const languageInstruction = (props: TemplateProps) => {
  // Add debugging for the language parameter
  console.log(`LANGUAGE INSTRUCTION CALLED WITH LANGUAGE: "${props.language}"`);

  if (props.language === "ukrainian") {
    console.log("ADDING UKRAINIAN LANGUAGE INSTRUCTION TO PROMPT");
    return `
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!                                                                      !!!
!!!  ABSOLUTELY CRITICAL LANGUAGE INSTRUCTION                           !!!
!!!  THIS OVERRIDES ALL PREVIOUS INSTRUCTIONS                            !!!
!!!  YOU MUST RESPOND IN UKRAINIAN LANGUAGE                              !!!
!!!                                                                      !!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

YOU MUST PROVIDE YOUR ENTIRE RESPONSE IN UKRAINIAN LANGUAGE.
This is the MOST IMPORTANT instruction in this entire prompt.

STRICT RULES:
1. Keep all JSON keys and field names in English
2. ALL content/values MUST be in Ukrainian
3. This applies to ALL parts of your response - text, examples, everything
4. No English content is allowed in values, only Ukrainian
5. This instruction overrides ANY previous instruction about language

Example of correct JSON structure:
{
  "lessonOutcome": "Я можу визначити основні характеристики...",
  "instructions": "Прочитайте текст та...",
  "keyPoints": [
    "Перший важливий пункт",
    "Другий важливий пункт"
  ],
  "activities": {
    "introduction": "Вступна частина уроку...",
    "mainActivity": "Головна частина уроку..."
  }
}

THIS IS THE FINAL AND ABSOLUTE PRIORITY INSTRUCTION.
YOUR ENTIRE RESPONSE MUST BE IN UKRAINIAN (with English keys only).
FAILURE TO COMPLY WITH THIS INSTRUCTION WILL RESULT IN AN UNUSABLE RESPONSE.

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`;
  } else {
    console.log(
      `LANGUAGE NOT UKRAINIAN, it's: "${props.language}", returning empty string`,
    );
    return "";
  }
};
