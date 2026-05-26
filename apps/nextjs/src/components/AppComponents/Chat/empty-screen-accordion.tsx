import React from "react";

import * as Accordion from "@radix-ui/react-accordion";

import { Icon } from "@/components/Icon";
import AiIcon from "@/components/SVGParts/AiIcon";
import LessonIcon from "@/components/SVGParts/LessonIcon";
import QuizIcon from "@/components/SVGParts/QuizIcon";
import SlidesIcon from "@/components/SVGParts/SlidesIcon";

const lessonPlanItems = [
  "Learning outcome",
  "Learning cycle outcomes",
  "Suggested prior knowledge",
  "Key learning points",
  "Misconceptions & common errors",
  "Keywords",
  "Prior knowledge starter quiz",
  "Learning cycles",
  "Assessment exit quiz",
];

const slideDeckItems = [
  "Prior knowledge starter quiz",
  "Outcome",
  "Keywords",
  "Lesson outline",
  "Learning cycles",
  "Assessment exit quiz",
  "Useful slide graphics",
];

const quizItems = ["Prior knowledge starter quiz", "Assessment exit quiz"];

const worksheetItems = ["Practice tasks"];

function SectionList({ items }: { readonly items: readonly string[] }) {
  return (
    <div className="flex flex-col gap-8 pl-20">
      {items.map((item) => (
        <div className="flex items-center gap-8" key={item}>
          <Icon icon="tick" size="sm" />
          <span className="text-base">{item}</span>
        </div>
      ))}
    </div>
  );
}

const EmptyScreenAccordion = () => {
  return (
    <Accordion.Root type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <AiIcon />1 lesson plan
        </AccordionTrigger>
        <AccordionContent>
          <SectionList items={lessonPlanItems} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <SlidesIcon />1 slide deck
        </AccordionTrigger>
        <AccordionContent>
          <SectionList items={slideDeckItems} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <QuizIcon />2 quizzes
        </AccordionTrigger>
        <AccordionContent>
          <SectionList items={quizItems} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>
          <LessonIcon />1 worksheet
        </AccordionTrigger>
        <AccordionContent>
          <SectionList items={worksheetItems} />
        </AccordionContent>
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
