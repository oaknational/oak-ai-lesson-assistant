import React from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";

import { LessonPlanProgressDropdownMenu } from "./LessonPlanProgressDropdownMenu";

export type LessonPlanProgressDropdownProps = Readonly<{
  lessonPlan: LooseLessonPlan;
  isStreaming: boolean;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}>;

export const LessonPlanProgressDropdown: React.FC<
  LessonPlanProgressDropdownProps
> = (props) => {
  const { sectionRefs } = useLessonChat();

  return (
    <LessonPlanProgressDropdownMenu {...props} sectionRefs={sectionRefs} />
  );
};
