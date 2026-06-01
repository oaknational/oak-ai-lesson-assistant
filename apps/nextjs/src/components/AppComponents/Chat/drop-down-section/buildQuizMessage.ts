type BuildQuizMessageInput = {
  sectionLabel: string;
  details: string;
  optionLabel: string;
};

export function buildQuizMessage({
  sectionLabel,
  details,
  optionLabel,
}: BuildQuizMessageInput): string {
  const detail = details ? `: ${details}` : "";
  switch (optionLabel) {
    case "Generate a new quiz":
      return `Generate a new ${sectionLabel}${detail}`;
    case "Change question":
      return `For the ${sectionLabel}, change question${detail}`;
    case "Add question":
      return `For the ${sectionLabel}, add a question${detail}`;
    case "Remove question":
      return `For the ${sectionLabel}, remove question${detail}`;
    default:
      return `For the ${sectionLabel}${detail}`;
  }
}
