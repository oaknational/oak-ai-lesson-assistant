import { z } from "zod";

export const keyStageSchema = z
  .union([
    z.enum([
      "ks1",
      "ks2",
      "ks3",
      "ks4",
      "ks5",
      "early-years-foundation-stage",
      "specialist",
      "further-education",
      "higher-education",
    ]),
    z.string(),
  ])
  .describe(
    "If none of the given key-stages fit what the user has requested, you can provide a custom key-stage as a string in sentence case.",
  );
