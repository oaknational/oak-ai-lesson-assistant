// This file contains the root router and procedure helpers that should be used
// across the entire API
import { analyticsRouter } from "./router/analytics";
import { appRouter as appApplicationRouter } from "./router/app";
import { appSessionsRouter } from "./router/appSessions";
import { authRouter } from "./router/auth";
import { chatRouter } from "./router/chat";
import { exportsRouter } from "./router/exports";
import { moderationRouter } from "./router/moderation";
import { resourcesRouter } from "./router/resources";
import { statRouter } from "./router/statistics";
import { router } from "./trpc";

export const appRouter = router({
  app: appApplicationRouter,
  appSessions: appSessionsRouter,
  analytics: analyticsRouter,
  auth: authRouter,
  chat: chatRouter,
  exports: exportsRouter,
  moderation: moderationRouter,
  resources: resourcesRouter,
  stat: statRouter,
});

export type AppRouter = typeof appRouter;
