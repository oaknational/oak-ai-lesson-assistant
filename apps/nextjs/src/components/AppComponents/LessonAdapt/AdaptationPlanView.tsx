"use client";

import { OakBox, OakFlex, OakP, OakSpan } from "@oaknational/oak-components";

interface TextEditItem {
  changeId: string;
  slideNumber: number;
  elementId: string;
  originalText: string;
  newText: string;
  reasoning: string;
}

interface TableCellEditItem {
  changeId: string;
  slideNumber: number;
  cellId: string;
  originalText: string;
  newText: string;
  reasoning: string;
}

interface TextElementDeletionItem {
  changeId: string;
  slideNumber: number;
  elementId: string;
  originalText: string;
  reasoning: string;
}

interface SlideDeletionItem {
  changeId: string;
  slideNumber: number;
  reasoning: string;
}

interface AdaptationPlanViewProps {
  plan: {
    intent: string;
    scope: string;
    totalChanges: number;
    classifierConfidence: number;
    slidesAgentResponse: {
      analysis: string;
      changes: {
        textEdits: TextEditItem[];
        tableCellEdits: TableCellEditItem[];
        textElementDeletions: TextElementDeletionItem[];
        slideDeletions: SlideDeletionItem[];
      };
      reasoning: string;
    };
  };
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <OakBox
      $background="bg-neutral"
      $pa="spacing-4"
      $borderRadius="border-radius-s"
    >
      <OakP $font="body-4">{children}</OakP>
    </OakBox>
  );
}

function TextEditCard({ edit }: { edit: TextEditItem }) {
  return (
    <OakBox
      $ba="border-solid-s"
      $borderColor="border-neutral-lighter"
      $borderRadius="border-radius-s"
      $pa="spacing-12"
    >
      <OakP $font="body-4" $color="text-subdued" $mb="spacing-4">
        Slide {edit.slideNumber}
      </OakP>
      <OakBox $mb="spacing-8">
        <OakP $font="body-3">
          <OakSpan className="line-through opacity-60">
            {edit.originalText}
          </OakSpan>
        </OakP>
        <OakP $font="body-3-bold">{edit.newText}</OakP>
      </OakBox>
      <OakP $font="body-4" $color="text-subdued">
        {edit.reasoning}
      </OakP>
    </OakBox>
  );
}

function TableCellEditCard({ edit }: { edit: TableCellEditItem }) {
  return (
    <OakBox
      $ba="border-solid-s"
      $borderColor="border-neutral-lighter"
      $borderRadius="border-radius-s"
      $pa="spacing-12"
    >
      <OakP $font="body-4" $color="text-subdued" $mb="spacing-4">
        Slide {edit.slideNumber} — Cell {edit.cellId}
      </OakP>
      <OakBox $mb="spacing-8">
        <OakP $font="body-3">
          <OakSpan className="line-through opacity-60">
            {edit.originalText}
          </OakSpan>
        </OakP>
        <OakP $font="body-3-bold">{edit.newText}</OakP>
      </OakBox>
      <OakP $font="body-4" $color="text-subdued">
        {edit.reasoning}
      </OakP>
    </OakBox>
  );
}

function DeletionCard({
  label,
  reasoning,
}: {
  label: string;
  reasoning: string;
}) {
  return (
    <OakBox
      $ba="border-solid-s"
      $borderColor="border-neutral-lighter"
      $borderRadius="border-radius-s"
      $pa="spacing-12"
    >
      <OakP $font="body-3" $mb="spacing-4">
        {label}
      </OakP>
      <OakP $font="body-4" $color="text-subdued">
        {reasoning}
      </OakP>
    </OakBox>
  );
}

function ChangeSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <OakBox $mb="spacing-16">
      <OakP $font="heading-7" $mb="spacing-8">
        {title} ({count})
      </OakP>
      <OakFlex $flexDirection="column" $gap="spacing-8">
        {children}
      </OakFlex>
    </OakBox>
  );
}

export function AdaptationPlanView({ plan }: AdaptationPlanViewProps) {
  const { slidesAgentResponse } = plan;
  const { changes } = slidesAgentResponse;

  return (
    <OakFlex $flexDirection="column" $gap="spacing-16">
      {/* Summary badges */}
      <OakFlex $gap="spacing-8" $flexWrap="wrap">
        <Badge>{plan.intent}</Badge>
        <Badge>{plan.scope}</Badge>
        <Badge>{plan.totalChanges} changes</Badge>
        <Badge>{Math.round(plan.classifierConfidence * 100)}% confidence</Badge>
      </OakFlex>

      {/* Analysis */}
      <OakBox
        $background="bg-neutral"
        $pa="spacing-12"
        $borderRadius="border-radius-s"
      >
        <OakP $font="body-3">{slidesAgentResponse.analysis}</OakP>
      </OakBox>

      {/* Text edits */}
      <ChangeSection title="Text edits" count={changes.textEdits.length}>
        {changes.textEdits.map((edit) => (
          <TextEditCard key={edit.changeId} edit={edit} />
        ))}
      </ChangeSection>

      {/* Table cell edits */}
      <ChangeSection
        title="Table cell edits"
        count={changes.tableCellEdits.length}
      >
        {changes.tableCellEdits.map((edit) => (
          <TableCellEditCard key={edit.changeId} edit={edit} />
        ))}
      </ChangeSection>

      {/* Text element deletions */}
      <ChangeSection
        title="Text deletions"
        count={changes.textElementDeletions.length}
      >
        {changes.textElementDeletions.map((d) => (
          <DeletionCard
            key={d.changeId}
            label={`Slide ${d.slideNumber}: "${d.originalText}"`}
            reasoning={d.reasoning}
          />
        ))}
      </ChangeSection>

      {/* Slide deletions */}
      <ChangeSection
        title="Slide deletions"
        count={changes.slideDeletions.length}
      >
        {changes.slideDeletions.map((d) => (
          <DeletionCard
            key={d.changeId}
            label={`Slide ${d.slideNumber}`}
            reasoning={d.reasoning}
          />
        ))}
      </ChangeSection>

      {/* Reasoning */}
      <OakBox>
        <OakP $font="heading-7" $mb="spacing-4">
          Reasoning
        </OakP>
        <OakP $font="body-3" $color="text-subdued">
          {slidesAgentResponse.reasoning}
        </OakP>
      </OakBox>
    </OakFlex>
  );
}
