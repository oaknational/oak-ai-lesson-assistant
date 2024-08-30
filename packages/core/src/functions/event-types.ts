import { ZodEventSchemas } from "inngest";
import { z } from "zod";

import { populateDemoStatusesSchema } from "./demo/populateDemoStatuses.schema";
import { generateLessonQuizEmbeddingsSchema } from "./lesson/generateLessonQuizEmbeddings.schema";
import { generatePlanForLessonSchema } from "./lesson/generatePlan.schema";
import { summariseLessonSchema } from "./lesson/summarise.schema";
import { summariseAllLessonsSchema } from "./lesson/summariseAll.schema";
import { embedLessonPlanSchema } from "./lessonPlan/embed.schema";
import { embedAllLessonPlansSchema } from "./lessonPlan/embedAll.schema";
import { embedAllLessonPlanPartsSchema } from "./lessonPlan/embedAllParts.schema";
import { embedLessonPlanPartSchema } from "./lessonPlan/embedPart.schema";
import { generateAllLessonPlansSchema } from "./lessonPlan/generateAll.schema";
import { processLessonPlanSchema } from "./lessonPlan/process.schema";
import { embedLessonSummarySchema } from "./lessonSummary/embed.schema";
import { embedAllLessonSummariesSchema } from "./lessonSummary/embedAll.schema";
import { addIdsToMessagesSchema } from "./migrations/addIdsToMessages.schema";
import { kvChatsToPrismaSchema } from "./migrations/kvChatsToPrisma.schema";
import { embedAllQuizAnswersSchema } from "./quizAnswer/embedAll.schema";
import { embedQuizAnswerSchema } from "./quizAnswer/generateQuizAnswerEmbeddings.schema";
import { embedAllQuizQuestionsSchema } from "./quizQuestion/embedAll.schema";
import { generateAllQuizQuestionsSchema } from "./quizQuestion/generateAll.schema";
import { embedQuizQuestionSchema } from "./quizQuestion/generateQuizQuestionEmbeddings.schema";
import { notifyModerationSchema } from "./slack/notifyModeration.schema";
import { notifyRateLimitSchema } from "./slack/notifyRateLimit.schema";
import { notifyUserBanSchema } from "./slack/notifyUserBan.schema";
import { embedAllSnippetsSchema } from "./snippet/embedAll.schema";
import { generateSnippetsForAllQuestionsSchema } from "./snippet/generateQuestionSnippets.schema";
import { embedSnippetSchema } from "./snippet/generateSnippetEmbeddings.schema";
import { recalculateStatisticsSchema } from "./statistics/recalculateStatistics.schema";
import { embedSubjectLessonQuizzesSchema } from "./subject/embedSubjectLessonQuizzes.schema";
import { embedSubjectLessonTranscriptsSchema } from "./subject/embedSubjectLessonTranscripts.schema";
import { generateLessonPlansForSubjectLessonsSchema } from "./subject/generatePlansForSubjectLessons.schema";
import { summariseSubjectLessonsSchema } from "./subject/summariseSubjectLessons.schema";
import { generateTranscriptEmbeddingsSchema } from "./transcript/generateTranscriptEmbeddings.schema";

const schemas = {
  "app/healthcheck": { data: z.any() },
  "app/transcript.embed": generateTranscriptEmbeddingsSchema,
  "app/snippet.embed": embedSnippetSchema,
  "app/quizQuestion.embed": embedQuizQuestionSchema,
  "app/quizQuestion.embedAll": embedAllQuizQuestionsSchema,
  "app/quizQuestion.generateAll": generateAllQuizQuestionsSchema,
  "app/quizAnswer.embed": embedQuizAnswerSchema,
  "app/quizAnswer.embedAll": embedAllQuizAnswersSchema,
  "app/quizAnswer.generateAll": generateAllQuizQuestionsSchema,
  "app/lesson.summarise": summariseLessonSchema,
  "app/lesson.summariseAll": summariseAllLessonsSchema,
  "app/lesson.generatePlan": generatePlanForLessonSchema,
  "app/subject.summarise": summariseSubjectLessonsSchema,
  "app/subject.lessonPlans": generateLessonPlansForSubjectLessonsSchema,
  "app/lesson.quiz.embed": generateLessonQuizEmbeddingsSchema,
  "app/subject.transcripts.embed": embedSubjectLessonTranscriptsSchema,
  "app/subject.quizzes.embed": embedSubjectLessonQuizzesSchema,
  "app/stats.recalculate": recalculateStatisticsSchema,
  "app/lessonSummary.embed": embedLessonSummarySchema,
  "app/lessonSummary.embedAll": embedAllLessonSummariesSchema,
  "app/lessonPlan.embed": embedLessonPlanSchema,
  "app/lessonPlan.embedAll": embedAllLessonPlansSchema,
  "app/lessonPlan.generateAll": generateAllLessonPlansSchema,
  "app/lessonPlan.process": processLessonPlanSchema,
  "app/lessonPlan.embedAllParts": embedAllLessonPlanPartsSchema,
  "app/lessonPlan.embedPart": embedLessonPlanPartSchema,
  "app/snippet.embedAll": embedAllSnippetsSchema,
  "app/snippet.generateForAllQuestions": generateSnippetsForAllQuestionsSchema,
  "app/migrations.kvChatsToPrisma": kvChatsToPrismaSchema,
  "app/migrations.addIdsToMessages": addIdsToMessagesSchema,
  "app/slack.notifyRateLimit": notifyRateLimitSchema,
  "app/slack.notifyModeration": notifyModerationSchema,
  "app/slack.notifyUserBan": notifyUserBanSchema,
  "app/demo.populateStatuses": populateDemoStatusesSchema,
} satisfies ZodEventSchemas;

export default schemas;
