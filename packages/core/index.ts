import { populateDemoStatuses } from "./src/functions/demo/populateDemoStatuses";
import { generateLessonQuizEmbeddings } from "./src/functions/lesson/generateLessonQuizEmbeddings";
import { generatePlanForLesson } from "./src/functions/lesson/generatePlan";
import { summariseLesson } from "./src/functions/lesson/summarise";
import { summariseAllLessons } from "./src/functions/lesson/summariseAll";
import { embedLessonPlan } from "./src/functions/lessonPlan/embed";
import { embedAllLessonPlans } from "./src/functions/lessonPlan/embedAll";
import { embedAllLessonPlanParts } from "./src/functions/lessonPlan/embedAllParts";
import { embedLessonPlanPart } from "./src/functions/lessonPlan/embedPart";
import { generateAllLessonPlans } from "./src/functions/lessonPlan/generateAll";
import { processLessonPlan } from "./src/functions/lessonPlan/process";
import { embedLessonSummary } from "./src/functions/lessonSummary/embed";
import { embedAllLessonSummaries } from "./src/functions/lessonSummary/embedAll";
import { embedAllQuizAnswers } from "./src/functions/quizAnswer/embedAll";
import { generateQuizAnswerEmbeddings } from "./src/functions/quizAnswer/generateQuizAnswerEmbeddings";
import { embedAllQuizQuestions } from "./src/functions/quizQuestion/embedAll";
import { generateAllQuizQuestions } from "./src/functions/quizQuestion/generateAll";
import { generateQuizQuestionEmbeddings } from "./src/functions/quizQuestion/generateQuizQuestionEmbeddings";
import { notifyModeration } from "./src/functions/slack/notifyModeration";
import { notifyModerationTeachingMaterials } from "./src/functions/slack/notifyModerationTeachingMaterials";
import { notifyRateLimit } from "./src/functions/slack/notifyRateLimit";
import { notifyUserBan } from "./src/functions/slack/notifyUserBan";
import { embedAllSnippets } from "./src/functions/snippet/embedAll";
import { generateSnippetsForAllQuestions } from "./src/functions/snippet/generateForAllQuestions";
import { generateSnippetEmbeddings } from "./src/functions/snippet/generateSnippetEmbeddings";
import { recalculateStatistics } from "./src/functions/statistics/recalculateStatistics";
import { embedSubjectLessonQuizzes } from "./src/functions/subject/embedSubjectLessonQuizzes";
import { embedSubjectLessonTranscripts } from "./src/functions/subject/embedSubjectLessonTranscripts";
import { generatePlansForSubjectLessons } from "./src/functions/subject/generatePlansForSubjectLessons";
import { summariseSubjectLessons } from "./src/functions/subject/summariseSubjectLessons";
import { generateTranscriptEmbeddings } from "./src/functions/transcript/generateTranscriptEmbeddings";

export { inngest } from "./src/inngest";
export * from "./src/data/subjectsAndKeyStages";
export * from "./src/models";
//export * from "./src/models/promptVariants";

export const functions = [
  generateTranscriptEmbeddings,
  generateSnippetEmbeddings,
  generateQuizQuestionEmbeddings,
  generateQuizAnswerEmbeddings,
  summariseLesson,
  summariseSubjectLessons,
  generateLessonQuizEmbeddings,
  embedSubjectLessonTranscripts,
  embedSubjectLessonQuizzes,
  recalculateStatistics,
  embedLessonSummary,
  embedAllLessonSummaries,
  embedAllSnippets,
  embedAllQuizAnswers,
  embedAllQuizQuestions,
  generateAllQuizQuestions,
  summariseAllLessons,
  generateSnippetsForAllQuestions,
  generatePlansForSubjectLessons,
  embedAllLessonPlans,
  embedLessonPlan,
  embedLessonPlanPart,
  embedAllLessonPlanParts,
  processLessonPlan,
  generatePlanForLesson,
  generateAllLessonPlans,
  notifyModeration,
  notifyModerationTeachingMaterials,
  notifyRateLimit,
  notifyUserBan,
  populateDemoStatuses,
];
