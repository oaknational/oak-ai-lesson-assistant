type KeyStageSlug =
  | "key-stage-1"
  | "key-stage-2"
  | "key-stage-3"
  | "key-stage-4"
  | "key-stage-5"
  | "early-years-foundation-stage";
/**
 * If a string starts with any of the keys in this map, it will be mapped to the
 * corresponding value.
 */
const startKeyStageMap: Record<string, KeyStageSlug> = {
  ks1: "key-stage-1",
  ks2: "key-stage-2",
  ks3: "key-stage-3",
  ks4: "key-stage-4",
  ks5: "key-stage-5",
  key_stage_1: "key-stage-1",
  key_stage_2: "key-stage-2",
  key_stage_3: "key-stage-3",
  key_stage_4: "key-stage-4",
  key_stage_5: "key-stage-5",
  eyfs: "early-years-foundation-stage",
  early_years: "early-years-foundation-stage",
  foundation_stage: "early-years-foundation-stage",
  reception: "early-years-foundation-stage",
  sixth_form: "key-stage-5",
  gcse: "key-stage-4",
  a_level: "key-stage-5",
  alevel: "key-stage-5",
  year_2: "key-stage-1",
  year_3: "key-stage-2",
  year_4: "key-stage-2",
  year_5: "key-stage-2",
  year_6: "key-stage-2",
  year_7: "key-stage-3",
  year_8: "key-stage-3",
  year_9: "key-stage-3",
  year_10: "key-stage-4",
  year_11: "key-stage-4",
  year_12: "key-stage-5",
  year_13: "key-stage-5",
};

/**
 * If a string is an exact key in this map, it will be mapped to the corresponding value.
 */
const exactKeyStageMap: Record<string, KeyStageSlug> = {
  year_1: "key-stage-1",
  year_1_2: "key-stage-1",
  "1_2": "key-stage-1",
  // 1-5 assume keystage
  1: "key-stage-1",
  2: "key-stage-2",
  3: "key-stage-3",
  4: "key-stage-4",
  5: "key-stage-5",
  // 6-13 assume year
  6: "key-stage-2",
  7: "key-stage-3",
  8: "key-stage-3",
  9: "key-stage-3",
  10: "key-stage-4",
  11: "key-stage-4",
  12: "key-stage-5",
  13: "key-stage-5",
};

export function parseKeyStage(maybeKeyStage: string): string {
  const strippedMaybeKeyStage = maybeKeyStage
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");

  // Check for exact matches first
  const exactMatch = exactKeyStageMap[strippedMaybeKeyStage];
  if (exactMatch) {
    return exactMatch;
  }

  // Check for a partial match
  const startMatch = Object.entries(startKeyStageMap).find(([key]) =>
    strippedMaybeKeyStage.startsWith(key),
  );
  if (startMatch) {
    return startMatch[1]; // Return the mapped value
  }

  return maybeKeyStage;
}

export function parseKeyStageSlugForAnalytics(keyStage: string): string {
  const canonical = parseKeyStage(keyStage);
  switch (canonical) {
    case "key-stage-1":
      return "ks1";
    case "key-stage-2":
      return "ks2";
    case "key-stage-3":
      return "ks3";
    case "key-stage-4":
      return "ks4";
    case "key-stage-5":
      return "ks5";
    case "early-years-foundation-stage":
      // analytics using the longer form for EYFS
      return "early-years-foundation-stage";
    default:
      return canonical;
  }
}
