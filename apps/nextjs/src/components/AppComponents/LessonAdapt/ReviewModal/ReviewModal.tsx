"use client";

import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
} from "@oaknational/oak-components";

import { AllChangesTab } from "./AllChangesTab";
import { SlidesTab } from "./SlidesTab";
import { ThumbnailsWithKlpTab } from "./ThumbnailsWithKlpTab";
import type { ReviewModalProps, ReviewTab } from "./types";

const TAB_CONFIG: { id: ReviewTab; label: string }[] = [
  { id: "slides", label: "Slides" },
  { id: "changes", label: "All Changes" },
  { id: "thumbnails", label: "Thumbnails" },
];

export function ReviewModal({
  isOpen,
  onClose,
  plan,
  presentationId,
  presentationUrl,
  thumbnails,
  slideKlpMappings,
  approvedChangeIds,
  onToggleChange,
  onApproveAll,
  onRejectAll,
  onExecute,
  isExecuting,
}: ReviewModalProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>("slides");

  if (!isOpen) return null;

  const totalChanges = plan.totalChanges;
  const approvedCount = approvedChangeIds.length;

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
                <OakBox
                  $background="bg-neutral"
                  $pa="spacing-4"
                  $borderRadius="border-radius-s"
                >
                  <OakP $font="body-4">{plan.scope}</OakP>
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

        {/* Tabs */}
        <OakBox $pa="spacing-16" className="border-b border-gray-200">
          <OakFlex $gap="spacing-8">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-2 border-gray-800 bg-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <OakP $font="heading-7">{tab.label}</OakP>
              </button>
            ))}
          </OakFlex>
        </OakBox>

        {/* Content */}
        <OakBox $pa="spacing-24" className="flex-1 overflow-auto">
          {activeTab === "slides" && (
            <SlidesTab
              presentationId={presentationId}
              presentationUrl={presentationUrl}
            />
          )}
          {activeTab === "changes" && (
            <AllChangesTab
              plan={plan}
              approvedChangeIds={approvedChangeIds}
              onToggleChange={onToggleChange}
            />
          )}
          {activeTab === "thumbnails" && (
            <ThumbnailsWithKlpTab
              thumbnails={thumbnails}
              slideKlpMappings={slideKlpMappings}
            />
          )}
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
                onClick={void onExecute}
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
