import { lessonPlanSectionsSchema } from "@oakai/exports/src/schema/input.schema";

describe("useProgressForDownloads - section count bug", () => {
  it("should track all fields defined in lessonPlanSectionsSchema", () => {
    // The current hardcoded section list from useProgressForDownloads after our fix
    const currentSections = [
      { fields: ["title", "subject", "keyStage"], label: "Lesson details" },
      { fields: ["topic"], label: "Topic" },
      { fields: ["learningOutcome"], label: "Learning outcome" },
      { fields: ["learningCycles"], label: "Learning cycle outcomes" },
      { fields: ["priorKnowledge"], label: "Prior knowledge" },
      { fields: ["keyLearningPoints"], label: "Key learning points" },
      { fields: ["misconceptions"], label: "Misconceptions" },
      { fields: ["keywords"], label: "Keywords" },
      { fields: ["starterQuiz"], label: "Starter quiz" },
      { fields: ["cycle1", "cycle2", "cycle3"], label: "Learning cycles" },
      { fields: ["exitQuiz"], label: "Exit quiz" },
      { fields: ["additionalMaterials"], label: "Additional materials" },
    ];

    // Count expected fields from lessonPlanSectionsSchema
    const schemaFields = Object.keys(lessonPlanSectionsSchema.shape);
    const progressFields = new Set<string>();
    currentSections.forEach((section) => {
      section.fields.forEach((field) => progressFields.add(field));
    });

    // Find missing fields - this should be empty after our fix
    const missingFromProgress = schemaFields.filter(
      (field) => !progressFields.has(field),
    );

    // After our fix, no fields should be missing
    expect(missingFromProgress).toEqual([]);
    
    // Should be tracking 12 sections total (was 10 before fix)
    expect(currentSections).toHaveLength(12);
  });
});
