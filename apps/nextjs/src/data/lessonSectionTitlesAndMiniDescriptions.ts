import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";

export const lessonSectionTitlesAndMiniDescriptions: Record<
  LessonPlanKey,
  { description: string }
> = {
  title: {
    description: "The name of the lesson.",
  },
  keyStage: {
    description: "The educational stage for which the lesson is intended.",
  },
  subject: {
    description: "The subject area of the lesson.",
  },
  topic: {
    description: "An optional topic that this lesson is part of.",
  },
  basedOn: {
    description: "An Oak lesson that this lesson is based on.",
  },
  learningOutcome: {
    description:
      "A short summary of the knowledge, skills and understanding students are expected to acquire by the end of the lesson.",
  },
  learningCycles: {
    description:
      "The objectives for each learning cycle which detail what students will understand or be able to do after each phase. Each learning cycle is a section containing an explanation, check for understanding, practice & feedback",
  },
  priorKnowledge: {
    description:
      "The existing knowledge and understanding that students should have before starting the lesson.",
  },
  keyLearningPoints: {
    description:
      "The most important concepts or skills that will be covered in the lesson.",
  },
  misconceptions: {
    description:
      "Common misunderstandings or errors students might have with respect to the lesson's content.",
  },
  keywords: {
    description:
      "Critical vocabulary or terms used throughout the lesson, aiding in understanding and retention.",
  },
  starterQuiz: {
    description:
      "Questions given at the beginning of the lesson to gauge students' prior knowledge and engage their interest.",
  },
  cycle1: {
    description:
      "A learning cycle is a section containing an explanation, check for understanding, practice & feedback. The first focuses on introducing foundational concepts.",
  },
  cycle2: {
    description:
      "A learning cycle is a section containing an explanation, check for understanding, practice & feedback. Later cycles build upon the knowledge from the previous cycles and introduce more complex or applied concepts.",
  },
  cycle3: {
    description:
      "A learning cycle is a section containing an explanation, check for understanding, practice & feedback, later cycles build upon the knowledge from the previous cycles and introduce more complex or applied concepts.",
  },
  exitQuiz: {
    description:
      "Questions to measure students' understanding of the lesson's objectives and the key concepts covered.",
  },
  additionalMaterials: {
    description:
      "Extra resources for further study or practice, including worksheets, readings, and interactive activities.",
  },
  homework: {
    description:
      "A homework task for the lesson, including practical aim, purpose of activity, teachers tip, equipment, method, results table, health and safety, risk assessment.",
  },
  // slides: {
  //   description:
  //     "Visual aids and presentations used throughout the lesson to support teaching and learning.",
  // },
};
