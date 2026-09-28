import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!dataset) {
  throw new Error("NEXT_PUBLIC_SANITY_DATASET is required");
}

const token = process.env.SANITY_AUTH_SECRET;

if (!token) {
  throw new Error("SANITY_AUTH_SECRET is required");
}

export const sanityClient = createClient({
  projectId: projectId,
  dataset: dataset,
  token: token,
  // Responses are cached by Next (see cms/data/cmsCache.ts), so the Sanity CDN adds little
  useCdn: false,
  apiVersion: "2023-02-27",
});
