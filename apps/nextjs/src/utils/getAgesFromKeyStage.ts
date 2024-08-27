export function getAgesFromKeyStage(keyStage: string | undefined) {
  if (keyStage === "Early Years Foundation Stage") return "3-5 years old";
  if (keyStage === "Key Stage 1") return "5-7 years old";
  if (keyStage === "Key Stage 2") return "7-11 years old";
  if (keyStage === "Key Stage 3") return "11-14 years old";
  if (keyStage === "Key Stage 4") return "14-16 years old";
}
