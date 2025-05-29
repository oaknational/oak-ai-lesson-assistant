import type { Action, ContextByMaterialType } from "../configSchema";
import { getLessonDetails } from "../promptHelpers";

export const buildComprehensionPrompt = (
  context: ContextByMaterialType["additional-comprehension"],
  action: Action,
) => {
  const { lessonPlan } = context;

  if (action === "refine") {
    return refineComprehensionPrompt(context);
  }

  return `
TASK: Make a COMPREHENSION TASK for a class of pupils in a UK school. 

You should make the COMPREHENSION TASK appropriate for the age of pupils in ${lessonPlan.keyStage || ""} and the subject ${lessonPlan.subject || ""}. 

PURPOSE: Pupils will use the comprehension text and use it to answer the questions. This should enable them to understand the content of the lesson and achieve the KEY LEARNING POINTS, LEARNING CYCLE OUTCOMES and LEARNING OUTCOME.

- Use only **British English** (no American phrases, spellings, or references).
- Ensure all content is **age-appropriate**, engaging, and educational.
- Include **tier 2 and tier 3 vocabulary**, with meanings explained in context.
- Use a clear, informative **textbook-style tone**.

The COMPREHENSION TASK should be structured and include all the following parts and should match the given schema:

Lesson title: ${lessonPlan.title || ""}

Year group: ${lessonPlan.keyStage ? lessonPlan.keyStage.replace("key-stage-", "") : ""}

Subject: ${lessonPlan.subject || ""}

Instructions (Read the text carefully and use it to answer the questions below)

**${
    Array.isArray(lessonPlan.learningCycles) &&
    lessonPlan.learningCycles.length > 0
      ? lessonPlan.learningCycles[0]
      : "Main Topic"
  }**

[Comprehension text 1 - 500-600 words]

**Questions**

1. [question 1]
2. [question 2]
3. [question 3]
4. [question 4]
5. [question 5]
6. [question 6]
7. [question 7]
8. [question 8]
9. [question 9]
10. [question 10]

**COMPREHENSION TEXT**

This text should 

- summarise the KEY LEARNING POINTS and understanding of this text should enable the pupil to achieve the LEARNING CYCLE OUTCOME.
- use short, clear sentences and paragraphs.
- include tier two and three vocabulary and the KEYWORDS but these and any other unfamiliar words should be explained in the context of the COMPREHENSION TEXT.
- use an informative, engaging, age-appropriate tone, similar to that in a textbook.
- begin with a short introduction that hooks the pupil's interest, followed by a clear explanation.
- include all KEY LEARNING POINTS and KEYWORDS that must be covered in this LEARNING CYCLE.
- be written as plain text with no bullet points or images.
- only include quotes if they do not contain any copyrighted material.

**COMPREHENSION QUESTIONS**

Include 10 COMPREHENSION QUESTIONS.  

QUESTION 1-5: MULTIPLE CHOICE QUESTIONS or SHORT ANSWER QUESTIONS. These should be the easiest to answer.

- MULTIPLE CHOICE QUESTIONS: one correct answer and two PLAUSIBLE DISTRACTORS that test for common misconceptions or mistakes.
- All answers should start with lower case letters unless they are a proper noun or a known acronym.
- Write the answers in alphabetical order.
- only include questions with positive phrasing. For example, do not ask, "Which of these is NOT a covalent bond?"
- Do NOT include "all of the above" or none of the above" as answers.
- SHORT ANSWER QUESTIONS: only require a few words as the answer.

QUESTION 6-10: LONGER RESPONSE QUESTIONS that require a few sentences as the answer. These should increase in difficulty.

- Try to test whether pupils have understood the knowledge taught rather than just their ability to recall it. For example, "Which of these is a prime number?" "4, 7, 10?" is better than "What is the definition of a prime number?" "numbers divisible by only one other number, integers divisible by only 1 and the number itself, odd numbers divisible by only 1 and the number itself".

If the pupil answers all of the questions, this should demonstrate their understanding of the COMPREHENSION TEXT and, therefore, the LEARNING CYCLE OUTCOME.

**COMPREHENSION ANSWERS**

For each LEARNING CYCLE, provide the comprehension answers.

- You should include the QUESTION with the corresponding ANSWER.
- Use **bullet points** for clarity.
- Use **slashes ( / )** to indicate synonyms or acceptable alternative answers.

**Answers**

1. [question 1]

[answer 1]

2. [question 2]

[answer 2]

3. [question 3]

[answer 3]

4. [question 4]

[answer 4]

5. [question 5]

[answer 5]

6. [question 6]

[answer 6]

7. [question 7]

[answer 7]

8. [question 8]

[answer 8]

9. [question 9]

[answer 9]

10. [question 10]

[answer 10]

**Lesson Details**:
${getLessonDetails(lessonPlan)}
  `;
};

const refineComprehensionPrompt = (
  context: ContextByMaterialType["additional-comprehension"],
) => {
  const { lessonPlan, previousOutput, message } = context;

  return `Modify the following comprehension task based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${message}

Adapt the task to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
  `;
};

export const buildComprehensionSystemMessage = () => {
  return `
You are an expert UK teacher generating a reading comprehension task.

**Guidelines**:
- Ensure tasks are **clear, subject-specific, and appropriate** for the given year group reading age.
- Keep questions **engaging and relevant** to reinforce learning.
- Questions 1-5 should be multiple choice or short answer questions
- Questions 6-10 should be longer response questions
- Include answers for all questions
- **Do not** include markdown in your response.
- **Do not** include any americanisms.
- Use only **British English** spellings and terminology.
  `;
};
