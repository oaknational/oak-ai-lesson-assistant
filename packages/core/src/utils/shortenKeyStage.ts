export const shortenKeyStage = (keyStage: string) => {
  const keyStageMap: Record<string, string> = {
    "key-stage-1": "KS1",
    "key-stage-2": "KS2",
    "key-stage-3": "KS3",
    "key-stage-4": "KS4",
  };

  return keyStageMap[keyStage] || keyStage;
};
