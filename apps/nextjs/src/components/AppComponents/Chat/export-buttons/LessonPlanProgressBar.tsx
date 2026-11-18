import React from "react";

import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";

import { useProgressForDownloads } from "../Chat/hooks/useProgressForDownloads";

export const LessonPlanProgressBar = () => {
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const isStreaming = useChatStore(
    (state) => state.ailaStreamingStatus !== "Idle",
  );
  const { totalSections, totalSectionsComplete } = useProgressForDownloads({
    lessonPlan,
    isStreaming,
  });

  return (
    <div className="flex items-center justify-center gap-10">
      <span className="flex items-center justify-center text-base whitespace-nowrap">
        {`${totalSectionsComplete} of ${totalSections} sections`}
      </span>
      <span className={`relative h-8 w-full rounded-full bg-gray-200`}>
        <span
          className={`absolute top-0 bottom-0 left-0 rounded-full bg-oakGreen`}
          style={{
            width: `${(totalSectionsComplete / totalSections) * 100}%`,
          }}
        />
      </span>
    </div>
  );
};
