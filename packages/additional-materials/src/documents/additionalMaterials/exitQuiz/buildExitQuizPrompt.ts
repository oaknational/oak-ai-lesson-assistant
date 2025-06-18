import type { Action, ContextByMaterialType } from "../configSchema";
import { getLessonDetails, language } from "../promptHelpers";

export const buildExitQuizPrompt = (
  context: ContextByMaterialType["additional-exit-quiz"],
  action: Action,
) => {
  const { lessonPlan } = context;

  if (action === "refine") {
    return refineExitQuizPrompt(context);
  }

  const keyStage = lessonPlan.keyStage || (lessonPlan.year as string);
  return `
TASK: Write a 10-question MULTIPLE CHOICE EXIT QUIZ for a class of pupils in a UK school.

PURPOSE: This EXIT QUIZ will assess pupils' understanding of the key learning from today's lesson. The quiz is designed to:
1. Check if pupils have met the learning objective
2. Identify any misconceptions that remain
3. Highlight areas where pupils may need further support

The EXIT QUIZ should be appropriate for the age of pupils in ${keyStage} and the subject ${lessonPlan.subject}. 

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
- Questions should get progressively harder

INCLUDE:
- Cover the MAIN LEARNING POINTS from the lesson
- Test application of knowledge, not just recall
- Include at least one question on each of the KEY CONCEPTS covered
- Check for understanding of the KEYWORDS taught
- Address any MISCONCEPTIONS highlighted in the lesson plan
- Use PLAUSIBLE DISTRACTORS that are:
    - Similar in length and style to the correct answer
    - Based on common errors or misunderstandings
    - Designed to check for deeper understanding
- At least one higher-order thinking question (application, analysis, evaluation)

AVOID:
- Negatively phrased questions (e.g., "Which is NOT…")
- "All of the above" or "None of the above" options
- True/false questions
- Testing trivial or tangential information

${language}
  `;
};

const refineExitQuizPrompt = (
  context: ContextByMaterialType["additional-exit-quiz"],
) => {
  const { lessonPlan, previousOutput, message } = context;

  return `Modify the following exit quiz based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${message}

Adapt the quiz to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
  `;
};

export const buildExitQuizSystemMessage = () => {
  return `
You are an expert UK teacher generating an exit quiz to assess learning from today's lesson.

Your task is to create a high-quality, age-appropriate multiple-choice quiz with 10 questions that tests understanding of the key learning points.

The quiz should follow this structure for each question:
1. A clear question (max 200 characters)
2. Three options (a, b, c) - one correct answer and two plausible distractors (max 80 characters each)

Make sure that:
- One correct answer is clearly marked as correct in your JSON output
- Distractors are plausible but unambiguously incorrect
- Answers follow alphabetical ordering
- Questions focus on the most important concepts from the lesson
- Questions test understanding rather than simple recall
- The content is appropriate for UK schools
- British English spelling and conventions are used throughout
- Any academic vocabulary is appropriate for the age group

Avoid:
- Negatively phrased questions (e.g., "Which is NOT…")
- "All of the above" or "None of the above" options
- True/false questions
  `;
};
