const keyStageMap: Record<string, string> = {
  1: "ks1",
  2: "ks2",
  3: "ks3",
  4: "ks4",
  5: "ks5",
  keystage1: "ks1",
  keystage2: "ks2",
  keystage3: "ks3",
  keystage4: "ks4",
  keystage5: "ks5",
  eyfs: "early-years-foundation-stage",
};

export function parseKeyStage(maybeKeyStage: string): string {
  maybeKeyStage = maybeKeyStage.toLowerCase().replace(/[^a-z0-9]/g, "");
  const keyStageSlug = keyStageMap[maybeKeyStage];

  return keyStageSlug ?? maybeKeyStage;
}
