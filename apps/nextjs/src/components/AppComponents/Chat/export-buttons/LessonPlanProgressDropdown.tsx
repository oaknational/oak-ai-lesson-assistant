import React, { useState } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Flex } from "@radix-ui/themes";

import { Icon } from "@/components/Icon";
import { scrollToRef } from "@/utils/scrollToRef";

import { useProgressForDownloads } from "../Chat/hooks/useProgressForDownloads";

type LessonPlanProgressDropdownProps = Readonly<{
  lessonPlan: LooseLessonPlan;
  isStreaming: boolean;
  sectionRefs: Record<string, React.MutableRefObject<HTMLDivElement | null>>;
  documentContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}>;

export const LessonPlanProgressDropdown: React.FC<
  LessonPlanProgressDropdownProps
> = ({ lessonPlan, sectionRefs, documentContainerRef, isStreaming }) => {
  const { sections, totalSections, totalSectionsComplete } =
    useProgressForDownloads({ lessonPlan, isStreaming });
  const [openProgressDropDown, setOpenProgressDropDown] = useState(false);

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
            {`${totalSectionsComplete} of ${totalSections} sections complete`}
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
            {sections.map(({ label, complete, key }) => (
              <DropdownMenu.Item key={`progress-download-dropdown-${key}`}>
                <button
                  disabled={!complete}
                  className="mb-7 flex gap-6"
                  onClick={() => {
                    if (key === "cycles" && complete) {
                      if (sectionRefs["cycle-1"]) {
                        scrollToRef({
                          ref: sectionRefs["cycle-1"],
                          containerRef: documentContainerRef,
                        });
                      }
                    } else if (complete) {
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
                    {complete && (
                      <Icon icon="tick" className="mr-2" size="sm" />
                    )}
                  </span>
                  <p>{label}</p>
                </button>
              </DropdownMenu.Item>
            ))}
          </Flex>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
