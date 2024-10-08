import { RawLesson, Captions } from "../zod-schema/zodSchema";
import { transformQuiz } from "./transformQuiz";

export function getUserPrompt({
  rawLesson,
  captions,
}: {
  rawLesson: RawLesson;
  captions: Captions;
}) {
  const {
    lessonTitle,
    keyStageSlug,
    subjectSlug,
    starterQuiz,
    exitQuiz,
    misconceptionsAndCommonMistakes,
    keyLearningPoints,
    pupilLessonOutcome,
    lessonKeywords,
  } = rawLesson;

  const introPromptPart = `I would like to generate a lesson plan for a lesson titled "${lessonTitle}" in ${subjectSlug} at ${keyStageSlug}.
  
`;

  const transcriptPromptPart = `The lesson has the following transcript which is a recording of the lesson being delivered by a teacher.
I would like you to base your response on the content of the lesson rather than imagining other content that could be valid for a lesson with this title.
Think about the structure of the lesson based on the transcript and see if it can be broken up into logical sections which correspond to the definition of a learning cycle.
The transcript may include introductory and exit quizzes, so include these if they are multiple choice. Otherwise generate the multiple choice quiz questions based on the content of the rawLesson.
The transcript is as follows:

<lesson-transcript>
${captions.map((c) => c.text).join(" ")}
</lesson-transcript>

`;

  const learningOutcomePromptPart = pupilLessonOutcome
    ? `The lesson should have the following learning outcome. Include this in the lesson plan:

-${pupilLessonOutcome}
  
`
    : "";

  const keyLearningPointsPromptPart = keyLearningPoints?.length
    ? `The lesson should include the following key learning points. Include these in the lesson plan:
    
${keyLearningPoints.map((k) => `- ${k.keyLearningPoint}`).join("\n")}
    
`
    : "";

  const misconceptionsPromptPart = misconceptionsAndCommonMistakes?.length
    ? `The lesson should include the following misconceptions. Include these in the lesson plan:

${misconceptionsAndCommonMistakes
  .map(
    (m, i) => `- Misconception ${i + 1}: ${m.misconception}
- Description ${i + 1}: ${m.response}`,
  )
  .join("\n")}
    
`
    : "";

  const lessonKeywordsPromptPart = lessonKeywords?.length
    ? `The lesson should include the following keywords. Include these in the lesson plan:

${lessonKeywords.map((k) => `- ${k.keyword}: ${k.description}`).join("\n")}
    
`
    : "";

  const starterQuizQuestions = starterQuiz ? transformQuiz(starterQuiz) : [];
  const starterQuizPromptPart = starterQuizQuestions.length
    ? `The lesson should include the following starter quiz questions. Include them in the lesson plan's starter quiz:

${JSON.stringify(starterQuizQuestions)}
    
`
    : "";

  const exitQuizQuestions = exitQuiz ? transformQuiz(exitQuiz) : [];
  const exitQuizPromptPart = exitQuizQuestions.length
    ? `The lesson should include the following exit quiz questions. Include them in the lesson plan's exit quiz:

${JSON.stringify(exitQuizQuestions)}
    
`
    : "";

  const userPrompt = [
    introPromptPart,
    transcriptPromptPart,
    learningOutcomePromptPart,
    keyLearningPointsPromptPart,
    misconceptionsPromptPart,
    lessonKeywordsPromptPart,
    starterQuizPromptPart,
    exitQuizPromptPart,
  ].join("");

  return userPrompt;
}
