const keyStageMap: Record<string, string[]> = {
  ks1: ["ks1", "ks2"],
  ks2: ["ks1", "ks2", "ks3"],
  ks3: ["ks2", "ks3", "ks4"],
  ks4: ["ks3", "ks4"],
};

export function parseKeyStagesForRagSearch(keyStage: string): string[] {
  return keyStageMap[keyStage] ?? [keyStage];
}
