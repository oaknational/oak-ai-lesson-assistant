import type { Action, ContextByMaterialType } from "../configSchema";
import { getLessonDetails, language } from "../promptHelpers";

export const buildStarterQuizPrompt = (
  context: ContextByMaterialType["additional-starter-quiz"],
  action: Action,
) => {
  const { lessonPlan } = context;

  if (action === "refine") {
    return refineStarterQuizPrompt(context);
  }

  const keyStage = lessonPlan.keyStage || (lessonPlan.year as string);
  return `
TASK: Write a 10-question MULTIPLE CHOICE QUIZ for a class of pupils in a UK school.

PURPOSE: This QUIZ will assess pupils' understanding of the PRIOR KNOWLEDGE required for the lesson. The QUIZ is designed to enable teachers to identify gaps in knowledge for individual pupils or groups of pupils that need to be addressed before the lesson starts. Pupils who get all questions correct have good understanding of the prior knowledge and are ready to start the lesson.

The QUIZ should be appropriate for the age of pupils in ${keyStage} and the subject ${lessonPlan.subject}. 

The quiz should use the following structure:

- Year group: ${keyStage}
- Subject: ${lessonPlan.subject}
- Lesson title: ${lessonPlan.title}

**Lesson Details**:
${getLessonDetails(lessonPlan)}

1. [question text here - max 200 characters]

a. [answer a - max 80 characters]

b. [answer b - max 80 characters]

c. [answer c - max 80 characters]

REQUIREMENTS:
- There should be 10 questions
- Each question should have one correct answer and two PLAUSIBLE DISTRACTORS
- Put answers in alphabetical order
- Answers should start with lower-case letters unless they are proper nouns or acronyms
- Questions should get harder as the quiz progresses

INCLUDE:
- At least one question testing understanding of a KEYWORD
- At least one question checking for a COMMON MISCONCEPTION
- Use PLAUSIBLE DISTRACTORS that are:
    - Similar in length and style to the correct answer
    - Believable but clearly incorrect with reasoning
    - Check that pupils do not have common misconceptions or errors
- Assess higher-order skills through application, analysis, or evaluation
- Questions which assess understanding of the content rather than just recall

AVOID:
- Negatively phrased questions (e.g., "Which is NOT…")
- "All of the above" or "None of the above" options
- True/false questions
- Questions about the content of the lesson
  `;
};

const refineStarterQuizPrompt = (
  context: ContextByMaterialType["additional-starter-quiz"],
) => {
  const { lessonPlan, previousOutput, message } = context;

  return `Modify the following starter quiz based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${message}

Adapt the quiz to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
  `;
};

export const buildStarterQuizSystemMessage = () => {
  return `
You are an expert UK teacher generating a starter quiz to assess prior knowledge.

Your task is to create a high-quality, age-appropriate multiple-choice quiz with 10 questions.

The quiz should follow this structure for each question:
1. A clear question (max 200 characters)
2. Three options (a, b, c) - one correct answer and two plausible distractors (max 80 characters each)

Make sure that:
- One correct answer is clearly marked as correct in your JSON output
- Distractors are plausible but unambiguously incorrect
- Answers follow alphabetical ordering
- Questions increase in difficulty through the quiz
- The content is appropriate for UK schools
- British English spelling and conventions are used throughout
- No jargon or overly technical language beyond the pupils' understanding

Avoid:
- Negatively phrased questions (e.g., "Which is NOT…")
- "All of the above" or "None of the above" options
- True/false questions

${language}
  `;
};
