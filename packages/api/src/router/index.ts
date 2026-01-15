import { router } from "../trpc";
import { adminRouter } from "./admin";
import { analyticsRouter } from "./analytics";
import { appRouter } from "./app";
import { authRouter } from "./auth";
import { cloudinaryRouter } from "./cloudinary";
import { exportsRouter } from "./exports";
import { healthRouter } from "./health";
import { lessonRouter } from "./lesson";
import { lessonSummaryRouter } from "./lesson-summary";
import { moderationsRouter } from "./moderations";
import { quizPlaygroundRouter } from "./quizPlayground";
import { subjectAndKeyStagesRouter } from "./subjectsAndKeyStage";
import { teachingMaterialsRouter } from "./teachingMaterialsRouter";

export const oakAppRouter = router({
  app: appRouter,
  auth: authRouter,
  lesson: lessonRouter,
  subjectsAndKeyStages: subjectAndKeyStagesRouter,
  lessonSummary: lessonSummaryRouter,
  cloudinaryRouter: cloudinaryRouter,
  exports: exportsRouter,
  moderations: moderationsRouter,
  health: healthRouter,
  admin: adminRouter,
  teachingMaterials: teachingMaterialsRouter,
  analytics: analyticsRouter,
  quizPlayground: quizPlaygroundRouter,
});

// export type definition of API
export type AppRouter = typeof oakAppRouter;
