export {
  quizDocInputSchema as exportDocQuizSchema,
  lessonPlanDocInputSchema as exportDocLessonPlanSchema,
  lessonSlidesInputSchema as exportSlidesFullLessonSchema,
  worksheetDocsInputSchema as exportSlidesWorksheetSchema,
} from "./src/schema/input.schema";
export type {
  QuizDocInputData as ExportDocQuizData,
  LessonPlanDocInputData as ExportDocLessonPlanData,
  LessonSlidesInputData as ExportSlidesFullLessonData,
  WorksheetSlidesInputData as ExportSlidesWorksheetData,
  LessonDeepPartial,
} from "./src/schema/input.schema";
