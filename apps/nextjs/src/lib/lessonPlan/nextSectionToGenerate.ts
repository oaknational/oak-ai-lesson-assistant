import {
  LooseLessonPlan,
  LessonPlanKeys,
} from "@oakai/aila/src/protocol/schema";

import { groupedSectionsInOrder } from "./sectionsInOrder";

// Method to determine the next sections to generate based on
// the current state of the lesson plan.
// We generate each section in a group, so this method will
// return the next group of sections to generate or
// any missing sections within the current group.
export function nextSectionsToGenerate(
  lessonPlan: LooseLessonPlan,
): LessonPlanKeys[] {
  // Iterate through the groupedSectionsInOrder array
  for (const sectionGroup of groupedSectionsInOrder) {
    // Filter out the missing sections within the group
    const missingSections = sectionGroup.filter(
      (section) => !(section in lessonPlan),
    );
    if (missingSections.length > 0) {
      // If there are missing sections, return them
      return missingSections;
    }
  }

  // If all sections are complete, return an empty array
  return [];
}
