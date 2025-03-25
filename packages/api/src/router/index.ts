import { router } from "../trpc";
import { adminRouter } from "./admin";
import { appRouter } from "./app";
import { authRouter } from "./auth";
import { cloudinaryRouter } from "./cloudinary";
import { exportsRouter } from "./exports";
import { generationRouter } from "./generations";
import { healthRouter } from "./health";
import { judgementRouter } from "./judgements";
import { lessonRouter } from "./lesson";
import { lessonSummaryRouter } from "./lesson-summary";
import { moderationsRouter } from "./moderations";
import { newFeatureFlag } from "./newFeatureFlag";
import { snippetRouter } from "./snippet";
import { subjectAndKeyStagesRouter } from "./subjectsAndKeyStage";
import { translateRouter } from "./translate";

export const oakAppRouter = router({
  app: appRouter,
  generations: generationRouter,
  auth: authRouter,
  lesson: lessonRouter,
  subjectsAndKeyStages: subjectAndKeyStagesRouter,
  lessonSummary: lessonSummaryRouter,
  judgement: judgementRouter,
  snippet: snippetRouter,
  cloudinaryRouter: cloudinaryRouter,
  exports: exportsRouter,
  newFeatureFlag: newFeatureFlag,
  moderations: moderationsRouter,
  health: healthRouter,
  admin: adminRouter,
  translate: translateRouter,
});

// export type definition of API
export type AppRouter = typeof oakAppRouter;
