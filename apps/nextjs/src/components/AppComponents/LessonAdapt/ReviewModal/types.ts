import type { AdaptationPlan, SlideContent } from "@oakai/lesson-adapters";

export type { SlideContent };

export interface Thumbnail {
  objectId: string;
  slideIndex: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AdaptationPlan;
  presentationId: string;
  presentationUrl: string;
  thumbnails: Thumbnail[] | null;
  slideKlpMappings: SlideContent[];
  approvedChangeIds: string[];
  onToggleChange: (changeId: string) => void;
  onApproveAll: () => void;
  onRejectAll: () => void;
  onExecute: () => Promise<void>;
  isExecuting: boolean;
}

export type ReviewTab = "slides" | "changes" | "thumbnails";
