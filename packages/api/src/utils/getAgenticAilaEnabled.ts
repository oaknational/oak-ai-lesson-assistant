import { serverSideFeatureFlag } from "./serverSideFeatureFlag";

export const AGENTIC_AILA_FEATURE_FLAG = "agentic-aila-nov-25";

export async function getAgenticAilaEnabled(): Promise<boolean> {
  return serverSideFeatureFlag(AGENTIC_AILA_FEATURE_FLAG);
}
