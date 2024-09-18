import { router } from "../trpc";
import { appSessionsRouter } from "./appSessions";
import { chatFeedbackRouter } from "./chatFeedback";
import { healthRouter } from "./health";

export const chatAppRouter = router({
  chat: router({
    appSessions: appSessionsRouter,
    chatFeedback: chatFeedbackRouter,
    health: healthRouter,
  }),
});

// export type definition of API
export type ChatAppRouter = typeof chatAppRouter;
