"use client";

import type { AdaptationPlan } from "@oakai/lesson-adapters";

import {
  OakBox,
  OakCheckBox,
  OakFlex,
  OakHeading,
  OakP,
  OakSpan,
} from "@oaknational/oak-components";

interface AllChangesTabProps {
  plan: AdaptationPlan;
  approvedChangeIds: string[];
  onToggleChange: (changeId: string) => void;
}

export function AllChangesTab({
  plan,
  approvedChangeIds,
  onToggleChange,
}: AllChangesTabProps) {
  const { changes } = plan.slidesAgentResponse;

  return (
    <OakFlex $flexDirection="column" $gap="spacing-24">
      {/* Analysis Summary */}
      <OakBox
        $background="bg-neutral"
        $pa="spacing-16"
        $borderRadius="border-radius-m"
      >
        <OakP $font="body-3">{plan.slidesAgentResponse.analysis}</OakP>
      </OakBox>

      {/* Text Edits */}
      {changes.textEdits.length > 0 && (
        <ChangeSection title={`Text Edits (${changes.textEdits.length})`}>
          {changes.textEdits.map((edit) => (
            <ChangeCard
              key={edit.changeId}
              changeId={edit.changeId}
              isApproved={approvedChangeIds.includes(edit.changeId)}
              onToggle={() => onToggleChange(edit.changeId)}
              slideNumber={edit.slideNumber}
            >
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
            </ChangeCard>
          ))}
        </ChangeSection>
      )}

      {/* Table Cell Edits */}
      {changes.tableCellEdits.length > 0 && (
        <ChangeSection
          title={`Table Cell Edits (${changes.tableCellEdits.length})`}
        >
          {changes.tableCellEdits.map((edit) => (
            <ChangeCard
              key={edit.changeId}
              changeId={edit.changeId}
              isApproved={approvedChangeIds.includes(edit.changeId)}
              onToggle={() => onToggleChange(edit.changeId)}
              slideNumber={edit.slideNumber}
              subtitle={`Cell: ${edit.cellId}`}
            >
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
            </ChangeCard>
          ))}
        </ChangeSection>
      )}

      {/* Text Deletions */}
      {changes.textElementDeletions.length > 0 && (
        <ChangeSection
          title={`Text Deletions (${changes.textElementDeletions.length})`}
        >
          {changes.textElementDeletions.map((deletion) => (
            <ChangeCard
              key={deletion.changeId}
              changeId={deletion.changeId}
              isApproved={approvedChangeIds.includes(deletion.changeId)}
              onToggle={() => onToggleChange(deletion.changeId)}
              slideNumber={deletion.slideNumber}
            >
              <OakBox $mb="spacing-8">
                <OakP $font="body-3" className="line-through opacity-60">
                  {deletion.originalText}
                </OakP>
              </OakBox>
              <OakP $font="body-4" $color="text-subdued">
                {deletion.reasoning}
              </OakP>
            </ChangeCard>
          ))}
        </ChangeSection>
      )}

      {/* Slide Deletions */}
      {changes.slideDeletions.length > 0 && (
        <ChangeSection
          title={`Slide Deletions (${changes.slideDeletions.length})`}
        >
          {changes.slideDeletions.map((deletion) => (
            <ChangeCard
              key={deletion.changeId}
              changeId={deletion.changeId}
              isApproved={approvedChangeIds.includes(deletion.changeId)}
              onToggle={() => onToggleChange(deletion.changeId)}
              slideNumber={deletion.slideNumber}
            >
              <OakP $font="body-3-bold" $color="text-error" $mb="spacing-8">
                Delete entire slide
              </OakP>
              <OakP $font="body-4" $color="text-subdued">
                {deletion.reasoning}
              </OakP>
            </ChangeCard>
          ))}
        </ChangeSection>
      )}

      {/* Slides Kept */}
      {changes.slidesToKeep.length > 0 && (
        <ChangeSection title={`Slides Kept (${changes.slidesToKeep.length})`}>
          {changes.slidesToKeep.map((kept) => (
            <OakBox
              key={kept.slideId}
              $ba="border-solid-s"
              $borderColor="border-neutral-lighter"
              $borderRadius="border-radius-s"
              $pa="spacing-12"
            >
              <OakP $font="body-4" $color="text-subdued" $mb="spacing-4">
                Slide {kept.slideNumber}
              </OakP>
              <OakP $font="body-3">
                {kept.reasoning ?? "No specific reasoning recorded"}
              </OakP>
            </OakBox>
          ))}
        </ChangeSection>
      )}

      {/* Reasoning */}
      <OakBox>
        <OakHeading tag="h3" $font="heading-6" $mb="spacing-8">
          Overall Reasoning
        </OakHeading>
        <OakP $font="body-3" $color="text-subdued">
          {plan.slidesAgentResponse.reasoning}
        </OakP>
      </OakBox>
    </OakFlex>
  );
}

function ChangeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <OakBox>
      <OakHeading tag="h3" $font="heading-6" $mb="spacing-12">
        {title}
      </OakHeading>
      <OakFlex $flexDirection="column" $gap="spacing-12">
        {children}
      </OakFlex>
    </OakBox>
  );
}

function ChangeCard({
  changeId,
  isApproved,
  onToggle,
  slideNumber,
  subtitle,
  children,
}: {
  changeId: string;
  isApproved: boolean;
  onToggle: () => void;
  slideNumber: number;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <OakBox
      $ba="border-solid-s"
      $borderColor={isApproved ? "border-success" : "border-neutral-lighter"}
      $borderRadius="border-radius-s"
      $pa="spacing-12"
      className={isApproved ? "bg-green-50" : ""}
    >
      <OakFlex $gap="spacing-12" $alignItems="flex-start">
        <OakCheckBox
          id={changeId}
          value={changeId}
          checked={isApproved}
          onChange={onToggle}
        />
        <OakBox className="flex-grow">
          <OakFlex $gap="spacing-8" $mb="spacing-8">
            <OakP $font="body-4" $color="text-subdued">
              Slide {slideNumber}
            </OakP>
            {subtitle && (
              <OakP $font="body-4" $color="text-subdued">
                — {subtitle}
              </OakP>
            )}
          </OakFlex>
          {children}
        </OakBox>
      </OakFlex>
    </OakBox>
  );
}
