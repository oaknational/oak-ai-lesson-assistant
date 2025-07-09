// Utility to get the correct Aila URL for lessons, teaching materials, or the Aila start page
export function getAilaUrl(type: "lesson" | "teaching-materials" | "start") {
  switch (type) {
    case "lesson":
      return "/aila/lesson";
    case "teaching-materials":
      return "/aila/teaching-materials";
    case "start":
      return "/aila";
    default:
      throw new Error(`Unknown Aila URL type: ${type as string}`);
  }
}
