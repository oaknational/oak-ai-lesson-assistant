import type { ResourceTypeValueType } from "@/lib/avo/Avo";

export type ExportsType =
  | "lessonSlides"
  | "lessonPlanDoc"
  | "starterQuiz"
  | "exitQuiz"
  | "worksheet"
  | "additionalMaterials"
  | "all";

const EXPORTS_CONFIG: Record<
  ExportsType,
  {
    title: string;
    analyticsMaterialType: ResourceTypeValueType | ResourceTypeValueType[];
    icon: "slides" | "lesson" | "quiz";
    ext: "pptx" | "docx" | "all";
  }
> = {
  all: {
    title: "All resources",
    icon: "lesson",
    ext: "all",
    analyticsMaterialType: [
      "slide deck",
      "lesson plan",
      "exit quiz",
      "starter quiz",
      "worksheet",
      "additional materials",
    ],
  },
  lessonSlides: {
    title: "Slide deck",
    icon: "slides",
    ext: "pptx",
    analyticsMaterialType: "slide deck",
  },
  lessonPlanDoc: {
    title: "Lesson plan",
    icon: "lesson",
    ext: "docx",
    analyticsMaterialType: "lesson plan",
  },
  starterQuiz: {
    title: "Quiz",
    icon: "quiz",
    ext: "docx",
    analyticsMaterialType: "exit quiz",
  },
  exitQuiz: {
    title: "Quiz",
    icon: "quiz",
    ext: "docx",
    analyticsMaterialType: "starter quiz",
  },
  worksheet: {
    title: "Worksheet",
    icon: "slides",
    ext: "docx",
    analyticsMaterialType: "worksheet",
  },
  additionalMaterials: {
    title: "Additional materials",
    icon: "lesson",
    ext: "docx",
    analyticsMaterialType: "additional materials",
  },
};

export function getExportsConfig(type: ExportsType) {
  return EXPORTS_CONFIG[type];
}
