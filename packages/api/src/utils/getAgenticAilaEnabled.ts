import { serverSideFeatureFlag } from "./serverSideFeatureFlag";

export const AGENTIC_AILA_FEATURE_FLAG = "agentic-aila-nov-25";

export async function getAgenticAilaEnabled(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "prd") {
    return false;
  }

  return serverSideFeatureFlag(AGENTIC_AILA_FEATURE_FLAG);
}
