export { exportDocLessonPlan } from "./src/exportDocLessonPlan";
export { exportSlidesFullLesson } from "./src/exportSlidesFullLesson";
export { exportDocQuiz } from "./src/exportDocQuiz";
export { downloadDriveFile } from "./src/downloadDriveFile";
export { exportAdditionalMaterials } from "./src/exportAdditionalMaterials";
export { exportDocsWorksheet } from "./src/exportDocsWorksheet";
export { exportQuizDesignerSlides } from "./src/exportQuizDesignerSlides";

export { findLatexPatterns } from "./src/gSuite/docs/findLatexPatterns";
export { svgToPng } from "./src/images/svgToPng";
export { latexToSvg } from "./src/images/latexToSvg";
export { latexToImageReplacements } from "./src/gSuite/docs/latexToImageReplacements";

export {
  quizDocInputSchema as exportDocQuizSchema,
  lessonPlanDocInputSchema as exportDocLessonPlanSchema,
  lessonSlidesInputSchema as exportSlidesFullLessonSchema,
  worksheetDocsInputSchema as exportDocsWorksheetSchema,
} from "./src/schema/input.schema";
export type {
  QuizDocInputData as ExportDocQuizData,
  LessonPlanDocInputData as ExportDocLessonPlanData,
  LessonSlidesInputData as ExportSlidesFullLessonData,
  WorksheetSlidesInputData as ExportSlidesWorksheetData,
  LessonDeepPartial,
} from "./src/schema/input.schema";
