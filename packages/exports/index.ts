export { exportDocLessonPlan } from "./src/exportDocLessonPlan";
export { exportSlidesFullLesson } from "./src/exportSlidesFullLesson";
export { exportDocQuiz } from "./src/exportDocQuiz";
export { downloadDriveFile } from "./src/downloadDriveFile";
export { exportAdditionalMaterials } from "./src/exportAdditionalMaterials";
export { exportDocsWorksheet } from "./src/exportDocsWorksheet";
export { exportQuizDesignerSlides } from "./src/exportQuizDesignerSlides";

// LaTeX rendering utilities (for testing/debugging)
export {
  findLatexPatterns,
  generateLatexHash,
} from "./src/gSuite/docs/findLatexPatterns";
export {
  renderLatexToPng,
  batchRenderLatex,
  clearRenderCache,
} from "./src/utils/latexRenderer";
export {
  uploadImage,
  uploadLatexImage,
  batchUploadImages,
  clearUploadCache,
} from "./src/utils/imageUploader";

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
