import React, { useState, useMemo } from "react";

import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Flex } from "@radix-ui/themes";

import { Icon } from "@/components/Icon";
import { scrollToRef } from "@/utils/scrollToRef";

export const LESSON_PLAN_SECTIONS = [
  { key: "title", title: "Title" },
  { key: "subject", title: "Subject" },
  { key: "keyStage", title: "Key Stage" },
  { key: "learningOutcome", title: "Learning Outcome" },
  { key: "learningCycles", title: "Learning Cycles" },
  { key: "priorKnowledge", title: "Prior Knowledge" },
  { key: "keyLearningPoints", title: "Key Learning Points" },
  { key: "misconceptions", title: "Misconceptions" },
  { key: "keywords", title: "Keywords" },
  { key: "starterQuiz", title: "Starter Quiz" },
  { key: "cycles", title: "Cycles 1-3" },
  { key: "exitQuiz", title: "Exit Quiz" },
  // { key: "additionalMaterials", title: "Additional Materials" }, Do not show the additional materials section
] as const;

export type LessonPlanSectionKey = (typeof LESSON_PLAN_SECTIONS)[number]["key"];

export type LessonPlanProgressDropdownProps = {
  lessonPlan: LooseLessonPlan;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const lessonPlanSectionIsComplete = (
  lessonPlan: LooseLessonPlan,
  key: LessonPlanSectionKey,
) => {
  if (key === "cycles") {
    return lessonPlan.cycle1 && lessonPlan.cycle2 && lessonPlan.cycle3;
  }
  return lessonPlan[key] !== undefined && lessonPlan[key] !== null;
};

export const LessonPlanProgressDropdown: React.FC<
  LessonPlanProgressDropdownProps
> = ({ lessonPlan, sectionRefs, documentContainerRef }) => {
  const [openProgressDropDown, setOpenProgressDropDown] = useState(false);

  const completedSections = useMemo(() => {
    return LESSON_PLAN_SECTIONS.filter(({ key }) =>
      lessonPlanSectionIsComplete(lessonPlan, key),
    ).length;
  }, [lessonPlan]);

  const allCyclesComplete = lessonPlanSectionIsComplete(lessonPlan, "cycles");

  return (
    <DropdownMenu.Root
      open={openProgressDropDown}
      onOpenChange={setOpenProgressDropDown}
    >
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-3"
          onClick={() => {
            setOpenProgressDropDown(true);
          }}
          data-testid="chat-progress"
        >
          <span>
            {`${completedSections} of ${LESSON_PLAN_SECTIONS.length} sections complete`}
          </span>
          <Icon
            icon={openProgressDropDown ? "chevron-up" : "chevron-down"}
            size="sm"
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className="rounded border-2 border-black bg-white p-10"
        >
          <Flex
            direction="column"
            gap="7"
            data-testid="lesson-plan-progress-dropdown-content"
          >
            {LESSON_PLAN_SECTIONS.map(({ key, title }) => (
              <DropdownMenu.Item key={key}>
                <button
                  disabled={!lessonPlanSectionIsComplete(lessonPlan, key)}
                  className="mb-7 flex gap-6"
                  onClick={() => {
                    if (key === "cycles" && allCyclesComplete) {
                      if (sectionRefs["cycle-1"]) {
                        scrollToRef({
                          ref: sectionRefs["cycle-1"],
                          containerRef: documentContainerRef,
                        });
                      }
                    } else if (lessonPlanSectionIsComplete(lessonPlan, key)) {
                      if (sectionRefs[key]) {
                        scrollToRef({
                          ref: sectionRefs[key] as React.RefObject<HTMLElement>,
                          containerRef: documentContainerRef,
                        });
                      }
                    }
                  }}
                >
                  <span className="flex w-14 items-center justify-center">
                    {lessonPlanSectionIsComplete(lessonPlan, key) && (
                      <Icon icon="tick" className="mr-2" size="sm" />
                    )}
                  </span>
                  <p>{title}</p>
                </button>
              </DropdownMenu.Item>
            ))}
          </Flex>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
