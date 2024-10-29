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
    analyticsResourceType: ResourceTypeValueType | ResourceTypeValueType[];
    icon: "slides" | "lesson" | "quiz";
    ext: "pptx" | "docx" | "all";
  }
> = {
  all: {
    title: "All resources",
    icon: "lesson",
    ext: "all",
    analyticsResourceType: [
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
    analyticsResourceType: "slide deck",
  },
  lessonPlanDoc: {
    title: "Lesson plan",
    icon: "lesson",
    ext: "docx",
    analyticsResourceType: "lesson plan",
  },
  starterQuiz: {
    title: "Quiz",
    icon: "quiz",
    ext: "docx",
    analyticsResourceType: "exit quiz",
  },
  exitQuiz: {
    title: "Quiz",
    icon: "quiz",
    ext: "docx",
    analyticsResourceType: "starter quiz",
  },
  worksheet: {
    title: "Worksheet",
    icon: "slides",
    ext: "docx",
    analyticsResourceType: "worksheet",
  },
  additionalMaterials: {
    title: "Additional materials",
    icon: "lesson",
    ext: "docx",
    analyticsResourceType: "additional materials",
  },
};

export function getExportsConfig(type: ExportsType) {
  return EXPORTS_CONFIG[type];
}
