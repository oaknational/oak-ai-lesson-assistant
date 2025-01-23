import React from "react";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { useChatStore } from "@/stores/chatStore";

import { useProgressForDownloads } from "../Chat/hooks/useProgressForDownloads";

export const LessonPlanProgressBar = () => {
  const { lessonPlan } = useLessonChat();
  const isStreaming = useChatStore((state) => state.isStreaming);

  const { totalSections, totalSectionsComplete } = useProgressForDownloads({
    lessonPlan,
    isStreaming,
  });

  return (
    <div className="flex items-center justify-center gap-10">
      <span className="flex items-center justify-center whitespace-nowrap text-base">
        {`${totalSectionsComplete} of ${totalSections} sections`}
      </span>
      <span className={`relative h-8 w-full rounded-full bg-gray-200`}>
        <span
          className={`absolute bottom-0 left-0 top-0 rounded-full bg-oakGreen`}
          style={{
            width: `${(totalSectionsComplete / totalSections) * 100}%`,
          }}
        />
      </span>
    </div>
  );
};
