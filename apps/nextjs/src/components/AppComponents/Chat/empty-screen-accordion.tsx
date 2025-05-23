import React from "react";

import { OakBox } from "@oaknational/oak-components";
import * as Accordion from "@radix-ui/react-accordion";

import { lessonSections } from "@/ai-apps/lesson-planner/lessonSection";
import { Icon } from "@/components/Icon";
import AiIcon from "@/components/SVGParts/AiIcon";
import LessonIcon from "@/components/SVGParts/LessonIcon";
import QuizIcon from "@/components/SVGParts/QuizIcon";
import SlidesIcon from "@/components/SVGParts/SlidesIcon";

import { handleRewordingSections } from "./export-buttons";

const EmptyScreenAccordion = () => {
  const slidesLessonSections = lessonSections.filter(
    (section) =>
      ![
        "Title",
        "Key stage",
        "Subject",
        "Prior knowledge",
        "Key learning points",
        "Misconceptions",
        "Starter quiz",
        "Exit quiz",
      ].includes(section),
  );

  const quizLessonSections = lessonSections.filter(
    (section) => !["Title", "Key stage", "Subject"].includes(section),
  );

  return (
    <Accordion.Root type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <AiIcon />1 lesson plan
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-8 pl-20">
            {lessonSections.map((section) => {
              if (
                section === "Title" ||
                section === "Key stage" ||
                section === "Subject"
              ) {
                return null;
              }
              return (
                <div className="flex items-center gap-8" key={section}>
                  <Icon icon="tick" size="sm" />

                  <span className="text-base">
                    {convertTitleCaseToSentenceCase(
                      handleRewordingSections(section),
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <SlidesIcon />1 slide deck
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-8 pl-20">
            {slidesLessonSections.map((section) => {
              if (
                section == "Title" ||
                section == "Key stage" ||
                section == "Subject"
              ) {
                return null;
              }
              return (
                <div className="flex items-center gap-8" key={section}>
                  <Icon icon="tick" size="sm" />
                  <span className="text-base">
                    {convertTitleCaseToSentenceCase(
                      handleRewordingSections(section),
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <QuizIcon />2 quizzes
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-8 pl-20">
            {quizLessonSections.map((section) => {
              if (
                section == "Title" ||
                section == "Key stage" ||
                section == "Subject"
              ) {
                return null;
              }
              return (
                <div className="flex items-center gap-8" key={section}>
                  <Icon icon="tick" size="sm" />
                  <span className="text-base">
                    {convertTitleCaseToSentenceCase(
                      handleRewordingSections(section),
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <div className="flex w-full items-center justify-between">
          <span className="flex w-full items-center gap-10 text-left text-base font-bold">
            <LessonIcon />1 worksheet
          </span>
        </div>
      </AccordionItem>
    </Accordion.Root>
  );
};

// Define prop types for each component
interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof Accordion.Item> {
  readonly children: React.ReactNode;
}

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Accordion.Trigger> {
  readonly children: React.ReactNode;
}

interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof Accordion.Content> {
  readonly children: React.ReactNode;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, ...props }, forwardedRef) => (
    <Accordion.Item
      {...props}
      ref={forwardedRef}
      className="border-b border-black border-opacity-20 py-10 first:border-t"
    >
      {children}
    </Accordion.Item>
  ),
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, ...props }, forwardedRef) => (
  <Accordion.Trigger
    {...props}
    ref={forwardedRef}
    className="flex w-full items-center justify-between"
  >
    <span className="flex w-full items-center gap-10 text-left text-base font-bold">
      {children}
    </span>
    <Icon icon="chevron-down" size="sm" />
  </Accordion.Trigger>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, ...props }, forwardedRef) => (
  <Accordion.Content {...props} ref={forwardedRef}>
    <div className="mt-10">{children}</div>
  </Accordion.Content>
));

AccordionContent.displayName = "AccordionContent";

export default EmptyScreenAccordion;

function convertTitleCaseToSentenceCase(titleCase: string) {
  const lowerCaseTitle = titleCase.toLowerCase();
  return lowerCaseTitle.charAt(0).toUpperCase() + lowerCaseTitle.slice(1);
}
