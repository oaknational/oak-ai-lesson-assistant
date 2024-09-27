import { router } from "../../trpc";
import { prepareUser } from "./prepareUser";

export const testSupportRouter = router({
  prepareUser,
});

export type TestSupportRouter = typeof testSupportRouter;
