type KeyStage =
  | "ks1"
  | "ks2"
  | "ks3"
  | "ks4"
  | "ks5"
  | "early-years-foundation-stage";
/**
 * If a string starts with any of the keys in this map, it will be mapped to the
 * corresponding value.
 */
const startKeyStageMap: Record<string, KeyStage> = {
  ks1: "ks1",
  ks2: "ks2",
  ks3: "ks3",
  ks4: "ks4",
  ks5: "ks5",
  key_stage_1: "ks1",
  key_stage_2: "ks2",
  key_stage_3: "ks3",
  key_stage_4: "ks4",
  key_stage_5: "ks5",
  eyfs: "early-years-foundation-stage",
  early_years: "early-years-foundation-stage",
  foundation_stage: "early-years-foundation-stage",
  reception: "early-years-foundation-stage",
  sixth_form: "ks5",
  gcse: "ks4",
  a_level: "ks5",
  alevel: "ks5",
  year_2: "ks1",
  year_3: "ks2",
  year_4: "ks2",
  year_5: "ks2",
  year_6: "ks2",
  year_7: "ks3",
  year_8: "ks3",
  year_9: "ks3",
  year_10: "ks4",
  year_11: "ks4",
  year_12: "ks5",
  year_13: "ks5",
};

/**
 * If a string is an exact key in this map, it will be mapped to the corresponding value.
 */
const exactKeyStageMap: Record<string, KeyStage> = {
  year_1: "ks1",
  year_1_2: "ks1",
  "1_2": "ks1",
  // 1-5 assume keystage
  1: "ks1",
  2: "ks2",
  3: "ks3",
  4: "ks4",
  5: "ks5",
  // 6-13 assume year
  6: "ks2",
  7: "ks3",
  8: "ks3",
  9: "ks3",
  10: "ks4",
  11: "ks4",
  12: "ks5",
  13: "ks5",
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
