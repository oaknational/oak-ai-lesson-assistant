"use client";

import React from "react";

import * as Accordion from "@radix-ui/react-accordion";

import { lessonSections } from "@/ai-apps/lesson-planner/lessonSection";
import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import { Icon } from "@/components/Icon";
import AiIcon from "@/components/SVGParts/AiIcon";
import LessonIcon from "@/components/SVGParts/LessonIcon";
import QuizIcon from "@/components/SVGParts/QuizIcon";
import SlidesIcon from "@/components/SVGParts/SlidesIcon";

import { handleRewordingSections } from "./export-buttons";

// Helper function to translate section names
const translateSection = (
  section: string,
  t: (key: string, replacements?: Record<string, string | number>) => string,
): string => {
  // Convert section to normalized key format (no spaces, keep case)
  const normalizedSection = section.replace(/\s+/g, "");

  // Get the translation
  const translationKey = `accordion.sections.${normalizedSection}`;
  return t(translationKey);
};

const EmptyScreenAccordion = () => {
  const { t } = useTranslation();

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
          <AiIcon />1 {t("accordion.lessonPlan")}
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
                    {translateSection(section, t)}
                  </span>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <SlidesIcon />1 {t("accordion.lessonPresentation")}
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
                    {translateSection(section, t)}
                  </span>
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <QuizIcon />2 {t("accordion.quizzes")}
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
                    {translateSection(section, t)}
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
            <LessonIcon />1 {t("accordion.pupilWorksheet")}
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
