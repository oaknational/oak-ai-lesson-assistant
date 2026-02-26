"use client";

import {
  OakAccordion,
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
} from "@oaknational/oak-components";

import { AdaptSlideCard } from "../AdaptSlideCard";
import { NoChangesAdaptation } from "./NoChangesAdaptation";
import { SlideDeleteAdaptation } from "./SlideDeleteAdaptation";
import { TextEditAdaptation } from "./TextEditAdaptation";
import { groupChangesBySlide } from "./groupChangesBySlide";
import type { ReviewModalProps } from "./types";

export function ReviewModal({
  isOpen,
  onClose,
  plan,
  thumbnails,
  slideKlpMappings,
  approvedChangeIds,
  onToggleChange,
  onApproveAll,
  onRejectAll,
  onExecute,
  isExecuting,
}: ReviewModalProps) {
  if (!isOpen) return null;

  const totalChanges = plan.totalChanges;
  const approvedCount = approvedChangeIds.length;
  const slides = groupChangesBySlide(plan, slideKlpMappings, thumbnails);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <OakBox
        $background="white"
        $borderRadius="border-radius-m"
        className="relative z-10 flex h-[90vh] w-[90vw] max-w-6xl flex-col overflow-hidden shadow-xl"
      >
        {/* Header */}
        <OakBox
          $pa="spacing-24"
          $background="bg-decorative1-subdued"
          className="border-b border-gray-200"
        >
          <OakFlex $justifyContent="space-between" $alignItems="center">
            <OakFlex $flexDirection="column" $gap="spacing-8">
              <OakHeading tag="h2" $font="heading-4">
                Review Adaptation Plan
              </OakHeading>
              <OakFlex $gap="spacing-12" $alignItems="center">
                <OakBox
                  $background="bg-neutral"
                  $pa="spacing-4"
                  $borderRadius="border-radius-s"
                >
                  <OakP $font="body-4">{plan.intent}</OakP>
                </OakBox>
                <OakP $font="body-3" $color="text-subdued">
                  {approvedCount} of {totalChanges} changes approved
                </OakP>
              </OakFlex>
            </OakFlex>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Close modal"
            >
              <OakIcon iconName="cross" />
            </button>
          </OakFlex>
        </OakBox>

        {/* Content */}
        <OakBox $pa="spacing-24" className="flex-1 overflow-auto">
          <OakFlex $flexDirection="column" $gap="spacing-16">
            {slides.map((slide) => {
              const isDeleted =
                slide.slideDeletion !== null &&
                approvedChangeIds.includes(slide.slideDeletion.changeId);

              return (
                <AdaptSlideCard
                  key={slide.slideNumber}
                  title={slide.title}
                  isDeleted={
                    slide.slideDeletion !== null ? isDeleted : undefined
                  }
                  thumbnailUrl={slide.thumbnailUrl}
                  thumbnailsLoading={thumbnails === null}
                >
                  {slide.description && (
                    <OakP $font="body-3">
                      <OakSpan $font="body-3-bold">{slide.typeLabel}</OakSpan>{" "}
                      {slide.description}
                    </OakP>
                  )}

                  {slide.klps.length > 0 && (
                    <OakAccordion
                      header="Key learning points"
                      id={`klp-${slide.slideNumber}`}
                    >
                      <OakFlex $flexDirection="column" $gap="spacing-8">
                        {slide.klps.map((klp, index) => (
                          <OakP key={index} $font="body-3">
                            {index + 1}. {klp}
                          </OakP>
                        ))}
                      </OakFlex>
                    </OakAccordion>
                  )}

                  {slide.slideDeletion && (
                    <SlideDeleteAdaptation
                      changeId={slide.slideDeletion.changeId}
                      reasoning={slide.slideDeletion.reasoning ?? ""}
                      isApproved={approvedChangeIds.includes(
                        slide.slideDeletion.changeId,
                      )}
                      onToggle={() =>
                        onToggleChange(slide.slideDeletion!.changeId)
                      }
                    />
                  )}

                  {slide.textEdits.map((edit) => (
                    <TextEditAdaptation
                      key={edit.changeId}
                      changeId={edit.changeId}
                      originalText={edit.originalText}
                      newText={edit.newText}
                      isApproved={approvedChangeIds.includes(edit.changeId)}
                      onToggle={() => onToggleChange(edit.changeId)}
                    />
                  ))}

                  {slide.tableEdits.map((edit) => (
                    <TextEditAdaptation
                      key={edit.changeId}
                      changeId={edit.changeId}
                      originalText={edit.originalText}
                      newText={edit.newText}
                      isApproved={approvedChangeIds.includes(edit.changeId)}
                      onToggle={() => onToggleChange(edit.changeId)}
                    />
                  ))}

                  {slide.textDeletions.map((deletion) => (
                    <TextEditAdaptation
                      key={deletion.changeId}
                      changeId={deletion.changeId}
                      originalText={deletion.originalText}
                      isApproved={approvedChangeIds.includes(deletion.changeId)}
                      onToggle={() => onToggleChange(deletion.changeId)}
                    />
                  ))}

                  {!slide.hasChanges && (
                    <NoChangesAdaptation reasoning={slide.keepReasoning} />
                  )}
                </AdaptSlideCard>
              );
            })}
          </OakFlex>
        </OakBox>

        {/* Footer */}
        <OakBox
          $pa="spacing-16"
          $background="bg-neutral"
          className="border-t border-gray-200"
        >
          <OakFlex $justifyContent="space-between" $alignItems="center">
            <OakFlex $gap="spacing-8">
              <OakSecondaryButton onClick={onApproveAll} disabled={isExecuting}>
                Approve All
              </OakSecondaryButton>
              <OakSecondaryButton onClick={onRejectAll} disabled={isExecuting}>
                Reject All
              </OakSecondaryButton>
            </OakFlex>
            <OakFlex $gap="spacing-8">
              <OakSecondaryButton onClick={onClose} disabled={isExecuting}>
                Cancel
              </OakSecondaryButton>
              <OakPrimaryButton
                onClick={() => void onExecute()}
                disabled={approvedCount === 0 || isExecuting}
              >
                {isExecuting
                  ? "Applying..."
                  : `Apply ${approvedCount} Change${approvedCount !== 1 ? "s" : ""}`}
              </OakPrimaryButton>
            </OakFlex>
          </OakFlex>
        </OakBox>
      </OakBox>
    </div>
  );
}
